# ExporTrace ICA Backend (Monolito)

Aplicación Monolítica para Exportadora San Andrés (ExporSan) — Planta pesquera CHD en San Andrés, Pisco, Perú.

## Arquitectura Monolítica

El sistema ha sido unificado en una sola aplicación Spring Boot (`lote-pesca-service`) que expone todos los módulos y servicios del backend en el puerto **8080**:

```
[Cliente PWA] ──(HTTP / SOAP)──> Monolito Backend (Puerto 8080)
                                      ├── Módulo de Autenticación & Seguridad (JWT)
                                      ├── Módulo de Lotes de Pesca & Especies
                                      ├── Módulo de Monitoreo de Cadena de Frío (Calidad)
                                      ├── Módulo de Certificación (BPM / Orquestación SANIPES)
                                      └── Service Registry & Auditoría (AOP)
```

- **Java 17** | **Spring Boot 3.4.6** | **MySQL 8** | **JWT** | **SOAP (WSDL)**

## Prerrequisitos

- Java 17+
- Maven 3.8+
- MySQL 8.0 local corriendo en puerto 3306 (o instancia remota)

## Correr localmente

### 1. Base de datos
Crea la base de datos local en tu MySQL:
```sql
CREATE DATABASE IF NOT EXISTS exporsan_lotes;
```

### 2. Compilar y empaquetar
Desde la raíz del backend o el módulo `lote-pesca-service`:
```bash
mvn clean package -DskipTests
```

### 3. Iniciar el Monolito
Ejecuta el proyecto Spring Boot:
```bash
cd lote-pesca-service
mvn spring-boot:run
```
Esto iniciará la aplicación en el puerto **8080**, migrará el esquema de base de datos automáticamente e insertará los seeders / datos de prueba iniciales.

## Flujo de Endpoints Unificado (Puerto 8080)

Todas las peticiones pasan ahora directamente a través de **http://localhost:8080**:

### 1. Autenticación (Auth)
- `POST /api/v1/auth/login` → Login (Credenciales de prueba: `admin` / `admin123`, `calidad` / `calidad123`)
- `POST /api/v1/auth/validate` → Validar token JWT

### 2. Lotes de Pesca & Especies
- `GET /api/v1/adaptadores/sip/lotes` → Listar lotes CHD
- `POST /api/v1/adaptadores/sip/lotes` → Crear nuevo lote
- `GET /api/v1/maestros/especies` → Listar especies y estados de veda

### 3. Monitoreo de Cadena de Frío (Calidad)
- `POST /api/v1/calidad/temperaturas` → Registrar temperatura para auditoría de frío
- `GET /api/v1/calidad/temperaturas/lote/{idLote}` → Historial de frío de un lote

### 4. Certificación & BPM (SANIPES)
- `POST /api/v1/orch/sanipes-check/{idLote}` → Iniciar/Orquestar trámite de certificación
- `GET /api/v1/orch/expediente-certificado/{idLote}` → Obtener expediente de certificación

### 5. Integración SOAP
- **WSDL URL:** `http://localhost:8080/ws/EmbarcacionesPort.wsdl`
- Operaciones disponibles para consultar, validar e insertar embarcaciones vía XML.

## Variables de Entorno soportadas

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `PORT` | `8080` | Puerto de escucha de la aplicación |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/exporsan_lotes` | URL de conexión MySQL |
| `SPRING_DATASOURCE_USERNAME` | `root` | Usuario de base de datos |
| `SPRING_DATASOURCE_PASSWORD` | `root` | Contraseña de base de datos |
| `JWT_SECRET` | `exporsan-ica-secret-jwt-security-key-2026-v1` | Clave secreta para firma JWT |
