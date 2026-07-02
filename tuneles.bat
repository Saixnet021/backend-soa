@echo off
title ExporTrace ICA - Túneles Cloudflare
echo ==========================================
echo  Abriendo tuneles Cloudflare para todos
echo  los servicios de ExporTrace ICA
echo ==========================================
echo.
echo NOTA: Se abriran ventanas separadas para cada tunel.
echo Cierra cada ventana manualmente para detener el tunel.
echo.

echo Iniciando tunel para Frontend (3000)...
start "Frontend :3000" cloudflared tunnel --url http://localhost:3000
timeout /t 3 /nobreak >nul

echo Iniciando tunel para API Gateway (8080)...
start "Gateway :8080" cloudflared tunnel --url http://localhost:8080
timeout /t 3 /nobreak >nul

echo Iniciando tunel para Auth Service (8090)...
start "Auth :8090" cloudflared tunnel --url http://localhost:8090
timeout /t 3 /nobreak >nul

echo Iniciando tunel para Lote Pesca Service (8081)...
start "Lote :8081" cloudflared tunnel --url http://localhost:8081
timeout /t 3 /nobreak >nul

echo Iniciando tunel para Monitoreo Cold Service (8082)...
start "Cold :8082" cloudflared tunnel --url http://localhost:8082
timeout /t 3 /nobreak >nul

echo Iniciando tunel para Certificacion Service (8083)...
start "Cert :8083" cloudflared tunnel --url http://localhost:8083
timeout /t 3 /nobreak >nul

echo Iniciando tunel para Service Registry (8084)...
start "Registry :8084" cloudflared tunnel --url http://localhost:8084
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo  LISTA DE TUNELES
echo ==========================================
echo.
echo  Revisa cada ventana para ver la URL
echo  publica asignada por Cloudflare (try.cloudflare.com)
echo.
echo  Ejemplo de URL: https://xxxxx.try.cloudflare.com
echo.
echo  Frontend   :3000  - Aplicacion web
echo  Gateway    :8080  - API Gateway (ESB)
echo  Auth       :8090  - Autenticacion
echo  Lote       :8081  - Lote Pesca
echo  Cold       :8082  - Monitoreo Calidad
echo  Cert       :8083  - Certificaciones
echo  Registry   :8084  - Servicio UDDI
echo.
echo ==========================================
echo  PRESIONA ENTER PARA ABRIR EL ARCHIVO
echo  DE LOG EN BLOQUE DE NOTAS...
echo ==========================================
pause >nul

echo.
echo  Las URLs se muestran en cada ventana.
echo  Para verlas, revisa cada ventana o
echo  ejecuta individualmente cada tunel.
echo.
pause