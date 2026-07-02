# ExporTrace ICA - Documentación de Arquitectura SOA

## 1. Visión General

ExporTrace ICA es un sistema de trazabilidad pesquera construido sobre una **arquitectura orientada a servicios (SOA)** que cumple con los principios del curso SOA. El sistema gestiona lotes de pesca desde la captura hasta la certificación SANIPES, utilizando microservicios independientes comunicados a través de un Enterprise Service Bus (ESB).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Presentación | Next.js (PWA) | 14.2 |
| UI Components | shadcn/ui + Tailwind CSS | — |
| State Management | Zustand | — |
| API Gateway (ESB) | Spring Cloud Gateway | 4.1 |
| Microservicios | Spring Boot | 3.4.6 |
| Seguridad | JWT (jjwt) | 0.11.5 |
| SOAP/WSDL | Spring Web Services + JAXB | — |
| Base de Datos | MySQL | 8.0 |
| Circuit Breaker | Resilience4j | 2.2.0 |
| BPM | ProcesoNegocio (Custom) | — |
| UDDI Registry | Service Registry (Custom) | — |

---

## 3. Arquitectura de Microservicios

### 3.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTACIÓN                             │
│              Next.js 14 PWA (localhost:3000)                     │
│    React • TypeScript • Tailwind CSS • shadcn/ui • Zustand      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST + SOAP
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (ESB)                             │
│                  Spring Cloud Gateway                           │
│                  localhost:8080                                  │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ JWT Auth     │ │ Rate Limiter │ │ Circuit      │            │
│  │ Filter       │ │ (10 req/s)   │ │ Breaker      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ Transform    │ │ CORS         │                              │
│  │ Filter       │ │ Config       │                              │
│  └──────────────┘ └──────────────┘                              │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│ Auth │ │ Lote │ │ Moni │ │ Cert │ │   Service    │
│ Serv │ │ Pesca│ │ tereo│ │ ific │ │   Registry   │
│:8090 │ │:8081 │ │:8082 │ │:8083 │ │   :8084      │
└──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──────┬───────┘
   │        │        │        │             │
   ▼        ▼        ▼        ▼             ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│MySQL │ │MySQL │ │MySQL │ │MySQL │ │    MySQL     │
│auth  │ │lotes │ │calid │ │certi │ │  registry    │
└──────┘ └──────┘ └──────┘ └──────┘ └──────────────┘
```

### 3.2 Microservicios

#### Auth Service (Puerto 8090)
- **Base de datos**: `exporsan_auth`
- **Responsabilidad**: Autenticación y autorización
- **Endpoints**:
  - `POST /api/v1/auth/login` → Login JWT
  - `POST /api/v1/auth/validate` → Validar token
  - `GET /api/v1/usuarios` → CRUD usuarios
- **Tecnologías**: Spring Security, JWT, BCrypt
- **AOP**: `@Auditable` en login

#### Lote Pesca Service (Puerto 8081)
- **Base de datos**: `exporsan_lotes`
- **Responsabilidad**: Gestión de lotes de pesca, especies y embarcaciones
- **Endpoints REST**:
  - `GET/POST /api/v1/maestros/lotes` → CRUD lotes
  - `GET/POST /api/v1/maestros/especies` → CRUD especies
  - `GET/PUT /api/v1/maestros/lotes/{id}/sanipes` → Estado SANIPES
  - `GET/PUT /api/v1/maestros/lotes/{id}/cadena-frio` → Cadena de frío
- **Endpoints SOAP**:
  - `POST /ws` → WSDL: `/ws/EmbarcacionesPort.wsdl`
  - Operaciones: ObtenerEmbarcaciones, RegistrarEmbarcacion, ValidarEstadoEmbarcacion
- **AOP**: `@Auditable` en crearLote, actualizarEstadoSanipes, actualizarEstadoCadenaFrio, actualizarVeda

#### Monitoreo Cold Service (Puerto 8082)
- **Base de datos**: `exporsan_calidad`
- **Responsabilidad**: Monitoreo de temperatura y calidad
- **Endpoints**:
  - `POST /api/v1/calidad/temperaturas` → Registrar temperatura
  - `GET /api/v1/calidad/temperaturas` → Listar temperaturas
  - `GET /api/v1/calidad/temperaturas/lote/{idLote}` → Por lote
  - `POST /api/v1/calidad/reglas` → Crear regla de calidad
  - `GET /api/v1/calidad/reglas` → Listar reglas
- **AOP**: `@Auditable` en registrarTemperatura, crearRegla

#### Certificación Service (Puerto 8083)
- **Base de datos**: `exporsan_certificacion`
- **Responsabilidad**: Orquestación de trámites SANIPES y BPM
- **Endpoints REST**:
  - `POST /api/v1/orch/certificar` → Orquestar trámite
  - `GET /api/v1/orch/expediente/{idLote}` → Generar expediente
  - `GET /api/v1/tramites` → Listar trámites
- **Endpoints BPM**:
  - `POST /api/v1/bpm/iniciar` → Iniciar proceso
  - `PUT /api/v1/bpm/{id}/avanzar` → Avanzar estado
  - `PUT /api/v1/bpm/{id}/resultado` → Registrar resultado
  - `GET /api/v1/bpm/procesos` → Listar procesos
  - `GET /api/v1/bpm/notificaciones` → Notificaciones
- **AOP**: `@Auditable` en orquestarTramite, obtenerExpediente

#### Service Registry (Puerto 8084)
- **Base de datos**: `service_registry`
- **Responsabilidad**: Simulación UDDI para registro y descubrimiento de servicios
- **Endpoints**:
  - `POST /api/v1/registry/register` → Registrar servicio
  - `DELETE /api/v1/registry/unregister/{name}` → Desregistrar
  - `PUT /api/v1/registry/heartbeat/{name}` → Heartbeat
  - `GET /api/v1/registry` → Listar servicios
  - `GET /api/v1/registry/{name}` → Buscar por nombre
  - `GET /api/v1/registry/category/{cat}` → Buscar por categoría
- **Scheduled**: Verificación de heartbeats cada 60s (marca UNHEALTHY si >5min sin heartbeat)

---

## 4. Enterprise Service Bus (ESB)

El API Gateway funciona como ESB central con los siguientes filtros globales:

### 4.1 Filtros de Seguridad
- **JwtAuthenticationFilter** (orden -1): Valida JWT en todas las rutas excepto login, test, registry, gateway/status
- **TransformFilter** (orden -1): Inyecta headers `X-Gateway-Timestamp` y `X-Servicio-Origen`

### 4.2 Filtros de Control
- **RateLimitFilter** (orden 0): Rate limiting por IP (10 req/s, burst 20)
- **CircuitBreaker**: Resilience4j con sliding window 10, failure threshold 50%, wait 30s

### 4.3 Endpoints de Status
- `GET /gateway/status` → Estado del gateway y servicios
- `GET /gateway/status/{servicio}` → Estado de un servicio específico

---

## 5. SOAP/WSDL - Embarcaciones

### 5.1 WSDL
- **URL**: `http://localhost:8081/ws/EmbarcacionesPort.wsdl`
- **Target Namespace**: `http://exporsan.com/embarcaciones`
- **Port Type**: `EmbarcacionesPort`

### 5.2 Operaciones

| Operación | Descripción | Input | Output |
|-----------|-------------|-------|--------|
| ObtenerEmbarcaciones | Consulta embarcaciones | idLote?, nombre? | Lista EmbarcacionType |
| RegistrarEmbarcacion | Registra embarcación | nombre, matricula, puerto, capacidad, capitan, licencia | id, mensaje |
| ValidarEstadoEmbarcacion | Valida estado por matrícula | matricula | matricula, nombre, puerto, estado, habilitada, mensaje |

### 5.3 EmbarcacionType
```xml
<xs:complexType name="EmbarcacionType">
  <xs:sequence>
    <xs:element name="id" type="xs:long"/>
    <xs:element name="nombreEmbarcacion" type="xs:string"/>
    <xs:element name="matricula" type="xs:string"/>
    <xs:element name="puertoBase" type="xs:string"/>
    <xs:element name="capacidadToneladas" type="xs:decimal"/>
    <xs:element name="estado" type="xs:string"/>
    <xs:element name="nombreCapitan" type="xs:string"/>
    <xs:element name="licenciaCapitan" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

---

## 6. XML en Endpoints REST

Todos los controllers REST soportan respuestas en JSON y XML mediante `jackson-dataformat-xml`:

```
Accept: application/json  →  {"id": 1, "nombre": "POTA"}
Accept: application/xml   →  <LotePesca><id>1</id><nombre>POTA</nombre></LotePesca>
```

---

## 7. Auditoría AOP

### 7.1 Anotación Personalizada
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String accion();
    String entidad();
}
```

### 7.2 Aspecto
- **AuditoriaAspect**: Intercepta métodos anotados con `@Auditable`
- Registra: timestamp, usuario, acción, entidad, entidadId, valorNuevo, resultado, servicio
- Captura exito y errores automáticamente

### 7.3 Tabla auditoria_log
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT AUTO_INCREMENT | ID del registro |
| timestamp | DATETIME | Fecha/hora de la operación |
| usuario_id | BIGINT | ID del usuario |
| usuario_username | VARCHAR | Username del usuario |
| accion | VARCHAR | Tipo de operación |
| entidad | VARCHAR | Entidad afectada |
| entidad_id | VARCHAR | ID de la entidad |
| valor_anterior | TEXT | Valor antes del cambio |
| valor_nuevo | TEXT | Valor después del cambio |
| ip_origen | VARCHAR | IP del cliente |
| resultado | VARCHAR | EXITO o ERROR |
| mensaje_error | TEXT | Mensaje de error si aplica |
| servicio | VARCHAR | Nombre del microservicio |

---

## 8. BPM - Procesos de Negocio

### 8.1 Máquina de Estados

```
INICIADO → ESPERANDO_DOCUMENTACION → ENVIADO_SANIPES → EN_REVISION → CERTIFICADO
                                     ↘ OBSERVADO ↗        ↘ RECHAZADO
```

### 8.2 Entidades

**ProcesoNegocio**:
- id, tipoProceso, loteId, tramiteId, estado, subEstado
- datosContexto (JSON), resultado, fechaInicio, fechaFin, fechaLimite

**Notificacion**:
- id, procesoId, usuarioId, tipo, mensaje, leida, fechaCreacion

### 8.3 Transiciones de Estado

| Estado Actual | Siguiente Estado | Descripción |
|---------------|-----------------|-------------|
| INICIADO | ESPERANDO_DOCUMENTACION | Se inicia el proceso |
| ESPERANDO_DOCUMENTACION | ENVIADO_SANIPES | Documentación completa |
| ENVIADO_SANIPES | EN_REVISION | SANIPES recibe expediente |
| EN_REVISION | CERTIFICADO | Aprobado |
| EN_REVISION | OBSERVADO | Con observaciones |
| OBSERVADO | ENVIADO_SANIPES | Observaciones subsanadas |
| EN_REVISION | RECHAZADO | Rechazado |

---

## 9. UDDI Service Registry

### 9.1 Modelo de Datos

**ServiceEntry**:
- id, serviceName (unique), serviceUrl, description, category, version
- status (ACTIVE/INACTIVE/UNHEALTHY), lastHeartbeat, registeredAt

### 9.2 Funcionalidades

1. **Registro**: Servicios se registran al iniciar
2. **Heartbeat**: Servicios envían heartbeat periódico
3. **Descubrimiento**: Consulta por nombre o categoría
4. **Salud**: Scheduler marca UNHEALTHY si >5min sin heartbeat
5. **Desregistrar**: Marca servicio como INACTIVE

---

## 10. Seguridad

### 10.1 JWT
- **Secret**: `exporsan-ica-secret-jwt-security-key-2026-v1`
- **Headers传递**: `X-User-Id`, `X-User-Rol`
- **Rutas públicas**: `/api/v1/auth/login`, `/api/v1/auth/test`, `/gateway/status`, `/api/v1/registry/**`

### 10.2 Roles
- **ADMIN**: Acceso completo
- **QA**: Calidad y monitoreo
- **LOGISTICA**: Lotes y certificaciones

---

## 11. Base de Datos

| Base de Datos | Microservicio | Tablas Principales |
|---------------|---------------|-------------------|
| exporsan_auth | auth-service | usuarios |
| exporsan_lotes | lote-pesca-service | lotes_pesca, especies, embarcaciones |
| exporsan_calidad | monitoreo-cold-service | auditoria_calidad, reglas_calidad |
| exporsan_certificacion | certificacion-service | tramites_sanipes, procesos_negocio, notificaciones |
| service_registry | service-registry | service_entries, auditoria_log |

---

## 12. Frontend PWA

### 12.1 Páginas
- `/login` → Autenticación
- `/dashboard` → Panel principal con métricas
- `/dashboard/lotes` → Lista de lotes
- `/dashboard/lotes/nuevo` → Crear lote
- `/dashboard/lotes/[id]` → Detalle de lote
- `/dashboard/calidad` → Monitoreo de temperatura + QR scanner
- `/dashboard/certificaciones` → Lista de certificaciones
- `/dashboard/certificaciones/[idLote]` → Expediente certificado + QR
- `/dashboard/especies` → Gestión de especies
- `/dashboard/usuarios` → Gestión de usuarios
- `/dashboard/arquitectura` → Panel de arquitectura SOA
- `/offline` → Página offline (PWA)

### 12.2 Funcionalidades PWA
- Service Worker registrado automáticamente
- Instalable en Android/iOS
- Funciona sin conexión (página offline)
- Cache de páginas visitadas

---

## 13. Endpoints del Gateway

| Ruta | Servicio Destino | Puerto |
|------|-----------------|--------|
| `/api/v1/auth/**` | auth-service | 8090 |
| `/api/v1/maestros/**` | lote-pesca-service | 8081 |
| `/api/v1/calidad/**` | monitoreo-cold-service | 8082 |
| `/api/v1/orch/**` | certificacion-service | 8083 |
| `/api/v1/tramites/**` | certificacion-service | 8083 |
| `/api/v1/bpm/**` | certificacion-service | 8083 |
| `/api/v1/registry/**` | service-registry | 8084 |
| `/api/v1/auditoria/**` | (múltiple) | — |
| `/ws/**` | lote-pesca-service | 8081 |
| `/gateway/status` | (gateway local) | 8080 |

---

## 14. Inicio del Sistema

### Windows
```bash
start.bat    # Iniciar todos los servicios
stop.bat     # Detener todos los servicios
```

### Linux/Mac
```bash
./start.sh   # Iniciar todos los servicios
./stop.sh    # Detener todos los servicios
```

### Servicios que se inician:
1. auth-service (8090)
2. lote-pesca-service (8081)
3. monitoreo-cold-service (8082)
4. certificacion-service (8083)
5. service-registry (8084)
6. api-gateway (8080)
7. Frontend Next.js (3000)

---

## 15. Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| calidad | calidad123 | QA |
| logistica | logistica123 | LOGISTICA |

---

## 16. Conceptos SOA Aplicados

| Concepto SOA | Implementación |
|--------------|----------------|
| **Servicios** | 6 microservicios independientes |
| **ESB** | API Gateway con filtros globales |
| **SOAP/WSDL** | Embarcaciones endpoint con XSD |
| **REST** | APIs REST con soporte JSON/XML |
| **UDDI** | Service Registry para descubrimiento |
| **BPM** | ProcesoNegocio con máquina de estados |
| **AOP** | Auditoría transversal con @Auditable |
| **Seguridad** | JWT con validación en gateway |
| **Circuit Breaker** | Resilience4j en gateway |
| **Rate Limiting** | 10 req/s por IP en gateway |
| **Servicio Desacoplado** | Cada servicio tiene su BD |
| **Orquestación** | Certificación orquesta SANIPES |
| **Statelessness** | Servicios sin estado, JWT stateless |
| **Reusabilidad** | SOAP expone operaciones reutilizables |
| **Contrato** | WSDL define contrato de servicios |
