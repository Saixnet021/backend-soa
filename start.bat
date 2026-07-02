@echo off
setlocal enabledelayedexpansion

title ExporTrace Ica - Sistema Completo - Iniciando

:: Configuración de directorios del proyecto
set "PROJECT_ROOT=%CD%"
set "BACKEND_ROOT=%PROJECT_ROOT%\exportrace-ica-backend"
set "FRONTEND_ROOT=%PROJECT_ROOT%\exportrace-ica-frontend"
set "LOGS_DIR=%PROJECT_ROOT%\logs"
set "PIDS_DIR=%PROJECT_ROOT%\.pids"

echo.
echo =================================================================
echo    ExporTrace Ica - Iniciando Sistema Completo
echo =================================================================
echo.

:: ===== LIBERAR PUERTOS Y DETENER PROCESOS ANTERIORES =====
echo [1/7] Liberando puertos de ejecuciones anteriores para evitar bloqueos...
for %%p in (8080 8081 8082 8083 8084 8090 3000) do (
  for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%p " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)
echo  OK: Puertos liberados y archivos desbloqueados.

:: ===== CREAR CARPETAS NECESARIAS =====
echo.
echo [2/7] Creando carpetas necesarias...
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
if not exist "%PIDS_DIR%" mkdir "%PIDS_DIR%"
echo  OK: Carpetas creadas

:: ===== VERIFICAR JAVA =====
echo.
echo [3/7] Verificando Java 17+...
where java >nul 2>&1
if errorlevel 1 (
  echo  ERROR: Java no encontrado en el PATH
  echo  DESCARGAR: https://adoptium.net
  pause
  exit /b 1
)
echo  OK: Java encontrado

:: ===== VERIFICAR NODE.JS =====
echo.
echo [4/7] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
  echo  ERROR: Node.js no encontrado en el PATH
  echo  DESCARGAR: https://nodejs.org
  pause
  exit /b 1
)
for /f %%v in ('node --version') do set NODE_VER=%%v
echo  OK: Node.js %NODE_VER%

:: ===== VERIFICAR MYSQL =====
echo.
echo [5/7] Verificando MySQL en localhost:3306...
powershell -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('localhost',3306); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo  WARNING: MySQL no esta corriendo en localhost:3306
  echo  Intentando iniciar MySQL...
  net start MySQL >nul 2>&1
  powershell -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('localhost',3306); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
  if errorlevel 1 (
    echo  ERROR: No se pudo conectar a MySQL. Inicielo manualmente e intente de nuevo.
    pause
    exit /b 1
  )
)
echo  OK: MySQL conectado en localhost:3306

:: ===== CREAR BASES DE DATOS MYSQL =====
echo.
echo [6/7] Verificando bases de datos MySQL...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -proot -h localhost -e "CREATE DATABASE IF NOT EXISTS exporsan_auth; CREATE DATABASE IF NOT EXISTS exporsan_lotes; CREATE DATABASE IF NOT EXISTS exporsan_calidad; CREATE DATABASE IF NOT EXISTS exporsan_certificacion; CREATE DATABASE IF NOT EXISTS service_registry;" >nul 2>&1
echo  OK: Bases de datos verificadas/creadas

:: ===== VERIFICAR / COMPILAR BACKEND =====
echo.
echo [7/7] Verificando compilacion de servicios Spring Boot...

set "NEED_BUILD=0"
for %%s in (auth-service lote-pesca-service monitoreo-cold-service certificacion-service service-registry api-gateway) do (
  set "FOUND_JAR="
  for %%f in ("%BACKEND_ROOT%\%%s\target\*.jar") do (
    set "FOUND_JAR=%%f"
  )
  if not defined FOUND_JAR (
    set "NEED_BUILD=1"
  )
)

if "%NEED_BUILD%"=="1" (
  echo  Detectados JARs faltantes. Compilando backend con Maven...
  cd /d "%BACKEND_ROOT%"
  call mvn clean package -DskipTests -q
  if errorlevel 1 (
    echo  ERROR: Fallo la compilacion del backend
    cd /d "%PROJECT_ROOT%"
    pause
    exit /b 1
  )
  cd /d "%PROJECT_ROOT%"
  echo  OK: Backend compilado exitosamente
) else (
  echo  OK: Todos los archivos JAR ya estan compilados. Omitiendo compilacion para ahorrar tiempo.
)

:: ===== INICIAR SERVICIOS BACKEND =====
echo.
echo Iniciando servicios backend en segundo plano...
echo.

call :start_service "auth-service"           8090
call :start_service "lote-pesca-service"     8081
call :start_service "monitoreo-cold-service" 8082
call :start_service "certificacion-service"  8083
call :start_service "service-registry"       8084
call :start_service "api-gateway"            8080

:: ===== ESPERAR ARRANQUE =====
echo.
echo Esperando 30 segundos para que los servicios arranquen...
timeout /t 30 /nobreak >nul

:: ===== VERIFICAR SERVICIOS =====
echo.
echo Verificando estado de los servicios...
call :check_service "auth-service"           8090
call :check_service "lote-pesca-service"     8081
call :check_service "monitoreo-cold-service" 8082
call :check_service "certificacion-service"  8083
call :check_service "service-registry"       8084
call :check_service "api-gateway"            8080

:: ===== INSTALAR / VERIFICAR FRONTEND =====
echo.
echo Verificando frontend...
if not exist "%FRONTEND_ROOT%\node_modules" (
  echo  Ejecutando npm install...
  cd /d "%FRONTEND_ROOT%"
  npm install >nul 2>&1
  if errorlevel 1 (
    echo  ERROR: npm install fallo
    cd /d "%PROJECT_ROOT%"
    pause
    exit /b 1
  )
  echo  OK: Dependencias instaladas
) else (
  echo  OK: node_modules ya existe, omitiendo npm install
)

:: ===== INICIAR FRONTEND =====
echo.
echo Iniciando frontend (Next.js)...
cd /d "%FRONTEND_ROOT%"
start "ExporTrace Frontend" /B npm run dev -- -p 3000 > "%LOGS_DIR%\frontend.log" 2>&1
cd /d "%PROJECT_ROOT%"

timeout /t 5 /nobreak >nul
echo  OK: Frontend iniciado

:: ===== INFORMACION FINAL =====
echo.
echo =================================================================
echo    ExporTrace Ica - Sistema Completo Iniciado
echo =================================================================
echo.
echo    URLs disponibles:
echo      Frontend:               http://localhost:3000
echo      API Gateway:            http://localhost:8080
echo      Auth Service:           http://localhost:8090
echo      Lote Pesca Service:     http://localhost:8081
echo      Monitoreo Cold Service: http://localhost:8082
echo      Certificacion Service:  http://localhost:8083
echo      Service Registry:       http://localhost:8084
echo.
echo    Credenciales de prueba:
echo      admin      / admin123      (ADMIN)
echo      calidad    / calidad123    (QA)
echo      logistica  / logistica123  (LOGISTICA)
echo.
echo    Logs en:
echo      Backend:   %LOGS_DIR%\
echo      Frontend:  %LOGS_DIR%\frontend.log
echo.
echo    Para detener todos los servicios: stop.bat
echo =================================================================
echo.
echo Presione cualquier tecla para cerrar esta ventana (los servicios siguen corriendo).
pause >nul
exit /b 0

:: ===================================================================
:: FUNCION: Iniciar un microservicio en segundo plano
::   Parametros: %~1 = nombre del servicio, %~2 = puerto
:: ===================================================================
:start_service
  set "SVC=%~1"
  set "PORT=%~2"
  set "JAR_PATTERN=%BACKEND_ROOT%\%SVC%\target\*.jar"

  :: Buscar el JAR real
  set "FOUND_JAR="
  for %%f in ("%BACKEND_ROOT%\%SVC%\target\*.jar") do (
      set "FOUND_JAR=%%f"
  )

  if not defined FOUND_JAR (
    echo  WARNING: No se encontro JAR para %SVC%, servicio omitido
    goto :eof
  )

  echo  Iniciando %SVC% en puerto %PORT%...
  start "%SVC%" /B java -jar "!FOUND_JAR!" --server.port=%PORT% > "%LOGS_DIR%\%SVC%.log" 2>&1
  echo  OK: %SVC% lanzado (log: %LOGS_DIR%\%SVC%.log)
goto :eof

:: ===================================================================
:: FUNCION: Verificar si un servicio responde en su puerto
::   Parametros: %~1 = nombre del servicio, %~2 = puerto
:: ===================================================================
:check_service
  set "SVC=%~1"
  set "PORT=%~2"
  curl -s --max-time 3 "http://localhost:%PORT%/actuator/health" >nul 2>&1
  if errorlevel 1 (
    echo  WARNING: %SVC% puerto %PORT% no responde aun - revisa %LOGS_DIR%\%SVC%.log
  ) else (
    echo  OK: %SVC% puerto %PORT% esta respondiendo
  )
goto :eof
