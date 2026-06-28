@echo off
setlocal enabledelayedexpansion

title ExporTrace Ica - Deteniendo Sistema

echo.
echo =================================================================
echo    ExporTrace Ica - Deteniendo todos los servicios
echo =================================================================
echo.

:: ===== DETENER PROCESOS JAVA (microservicios Spring Boot) =====
echo [1/3] Deteniendo microservicios Spring Boot...

set JAVA_KILLED=0
for /f "tokens=1" %%p in ('tasklist /fi "imagename eq java.exe" /fo csv /nh 2^>nul ^| findstr /i "java"') do (
  set "RAW=%%p"
  set "PID=!RAW:"=!"
  taskkill /F /PID !PID! >nul 2>&1
  if not errorlevel 1 (
    echo  OK: Proceso Java PID !PID! detenido
    set /a JAVA_KILLED+=1
  )
)

if %JAVA_KILLED%==0 (
  echo  INFO: No habia procesos Java corriendo
) else (
  echo  OK: %JAVA_KILLED% proceso^(s^) Java detenido^(s^)
)

:: ===== DETENER FRONTEND NODE.JS EN PUERTO 3000 =====
echo.
echo [2/3] Deteniendo frontend Next.js en puerto 3000...

set NODE_KILLED=0
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
  if not "%%p"=="0" (
    taskkill /F /PID %%p >nul 2>&1
    if not errorlevel 1 (
      echo  OK: Proceso frontend PID %%p detenido
      set /a NODE_KILLED+=1
    )
  )
)

if %NODE_KILLED%==0 (
  echo  INFO: No habia procesos frontend corriendo en puerto 3000
) else (
  echo  OK: Frontend detenido
)

:: ===== LIMPIEZA DE ARCHIVOS TEMPORALES =====
echo.
echo [3/3] Limpiando archivos temporales...

if exist ".pids" (
  rmdir /s /q ".pids" >nul 2>&1
  echo  OK: Carpeta .pids eliminada
)

echo.
echo =================================================================
echo    Todos los servicios ExporTrace Ica han sido detenidos
echo =================================================================
echo.
echo Presione cualquier tecla para cerrar...
pause >nul
exit /b 0
