# ExporTrace ICA Backend

Suite SOA para Exportadora San Andrés (ExporSan) — Planta pesquera CHD en San Andrés, Pisco, Perú.

## Arquitectura

```
api-gateway (8080) → Punto de entrada único
    ├── auth-service (8090)         → JWT login/validate
    ├── lote-pesca-service (8081)   → Lotes + Especies
    ├── monitoreo-cold-service (8082)→ Auditorías de temperatura
    └── certificacion-service (8083)→ Orquestación SANIPES
```

- **Java 17** | **Spring Boot 3.4.6** | **Spring Cloud Gateway** | **MySQL 8** | **JWT**

## Prerrequisitos

- Java 17+
- Maven 3.8+
- MySQL 8.0 (o Docker)

## Correr localmente

### 1. Base de datos

```sql
CREATE DATABASE IF NOT EXISTS exporsan_auth;
CREATE DATABASE IF NOT EXISTS exporsan_lotes;
CREATE DATABASE IF NOT EXISTS exporsan_calidad;
CREATE DATABASE IF NOT EXISTS exporsan_certificacion;
```

### 2. Compilar todo

```bash
cd exportrace-ica-backend
mvn clean install -DskipTests
```

### 3. Iniciar servicios (en orden)

```bash
# Terminal 1 - Auth Service
cd auth-service && mvn spring-boot:run

# Terminal 2 - Lote Pesca Service
cd lote-pesca-service && mvn spring-boot:run

# Terminal 3 - Monitoreo Cold Service
cd monitoreo-cold-service && mvn spring-boot:run

# Terminal 4 - Certificación Service
cd certificacion-service && mvn spring-boot:run

# Terminal 5 - API Gateway
cd api-gateway && mvn spring-boot:run
```

### 4. Correr con Docker

```bash
docker-compose up --build
```

## Flujo End-to-End

```bash
# 1. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"calidad","password":"calidad123"}'

# 2. Crear lote (usar token del paso 1)
curl -X POST http://localhost:8080/api/v1/adaptadores/sip/lotes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"codigoLote":"LOT-2026-010","especie":"POTA","nombreEmbarcacion":"Test Ship","pesoKg":2000}'

# 3. Registrar temperatura
curl -X POST http://localhost:8080/api/v1/calidad/temperaturas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"idLote":1,"idInspector":2,"temperaturaCelsius":-16.5,"idCamara":"CAMARA-01"}'

# 4. Solicitar certificado SANIPES
curl -X POST http://localhost:8080/api/v1/orch/sanipes-check/1 \
  -H "Authorization: Bearer <token>"

# 5. Obtener expediente
curl http://localhost:8080/api/v1/orch/expediente-certificado/1 \
  -H "Authorization: Bearer <token>"
```

## Usuarios de prueba

| Usuario   | Password     | Rol       |
|-----------|-------------|-----------|
| admin     | admin123    | ADMIN     |
| calidad   | calidad123  | QA        |
| logistica | logistica123| LOGISTICA |

## Endpoints

### Auth Service (8090 / via gateway 8080)
- `POST /api/v1/auth/login` → Login
- `POST /api/v1/auth/validate` → Validar token

### Lote Pesca Service (8081 / via gateway 8080)
- `GET /api/v1/adaptadores/sip/lotes` → Listar lotes
- `GET /api/v1/adaptadores/sip/lotes/{id}` → Lote por ID
- `POST /api/v1/adaptadores/sip/lotes` → Crear lote
- `PUT /api/v1/adaptadores/sip/lotes/{id}/estado-sanipes` → Actualizar estado
- `GET /api/v1/adaptadores/sip/lotes/especie/{especie}/estado/{estado}` → Filtrar
- `GET /api/v1/maestros/especies` → Listar especies
- `PUT /api/v1/maestros/especies/{id}/edav` → Actualizar veda

### Monitoreo Cold Service (8082 / via gateway 8080)
- `POST /api/v1/calidad/temperaturas` → Registrar temperatura
- `GET /api/v1/calidad/temperaturas/lote/{idLote}` → Historial
- `GET /api/v1/calidad/temperaturas/lote/{idLote}/resumen` → Resumen frío
- `GET /api/v1/calidad/reglas` → Listar reglas
- `POST /api/v1/calidad/reglas` → Crear regla

### Certificación Service (8083 / via gateway 8080)
- `POST /api/v1/orch/sanipes-check/{idLote}` → Orquestar trámite
- `GET /api/v1/orch/expediente-certificado/{idLote}` → Expediente
- `GET /api/v1/tramites/lote/{idLote}` → Trámites del lote

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| JWT_SECRET | exporsan-ica-secret-2026 | Clave JWT compartida |
| SPRING_DATASOURCE_URL | jdbc:mysql://localhost:3306/... | URL MySQL |
| SPRING_DATASOURCE_USERNAME | root | Usuario MySQL |
| SPRING_DATASOURCE_PASSWORD | root | Password MySQL |
