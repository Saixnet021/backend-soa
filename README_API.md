# ExporTrace Ica — Documentación de APIs REST

**Base URL:** `http://localhost:8080/api/v1`  
**Autenticación:** Bearer JWT Token en header `Authorization`  
**Formato:** JSON  

---

## Estructura de Controladores y Cobertura CRUD

> [!NOTE]
> Dependiendo del dominio y las reglas de negocio de la arquitectura SOA, algunos módulos disponen de un ciclo CRUD completo, mientras que otros exponen endpoints puramente transaccionales.

| Módulo / Controlador | Cobertura CRUD | Métodos Soportados | Propósito Principal |
|---|---|---|---|
| **Especies** (`EspecieController`) | **CRUD Completo** | `GET`, `POST`, `PUT`, `DELETE` | Configuración maestra de especies y umbrales térmicos. |
| **Lotes CHD** (`LotePescaController`) | **CRUD Parcial** | `GET`, `POST`, `PUT` | Integración del sistema SIP legacy y control de estados. |
| **Auditorías** (`AuditoriaCalidadController`) | **Registro e Historial** | `GET`, `POST` | Control de calidad térmica e inspección (QualityTrac). |
| **Orquestación** (`TramiteSanipesController`) | **Flujo SOA ESB** | `GET`, `POST` | Simulación del ESB WSO2 para validación y emisión de certificados. |

---

## Autenticación

### `POST` http://localhost:8080/api/v1/auth/login
Obtiene token JWT para autenticarse en el resto de endpoints.

> [!TIP]
> **Sin autenticación requerida.** Este endpoint es público.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200 (OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc3OTkzMTQ3MywiZXhwIjoxNzgwMDE3ODczfQ...",
  "username": "admin"
}
```

**Usuarios preestablecidos en el sistema:**
| Usuario | Contraseña | Rol / Permiso |
|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` |
| `logistica` | `logistica123` | `ROLE_LOGISTICA` |
| `calidad` | `calidad123` | `ROLE_CALIDAD` |

---

## Especies (GestionEspecieService)

### `GET` http://localhost:8080/api/v1/especies
Lista todas las especies registradas en el sistema.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
[
  {
    "id": 1,
    "nombreComun": "Pota",
    "nombreCientifico": "Dosidicus gigas",
    "codigoSanipes": "ESP-001",
    "enVeda": false,
    "tempMinCritica": -18.0,
    "tempMaxCritica": -15.0
  },
  {
    "id": 3,
    "nombreComun": "Anchoveta",
    "nombreCientifico": "Engraulis ringens",
    "codigoSanipes": "ESP-003",
    "enVeda": true,
    "tempMinCritica": -20.0,
    "tempMaxCritica": -16.0
  }
]
```

### `GET` http://localhost:8080/api/v1/especies/{id}
Obtiene una especie específica por su identificador primario.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
{
  "id": 1,
  "nombreComun": "Pota",
  "nombreCientifico": "Dosidicus gigas",
  "codigoSanipes": "ESP-001",
  "enVeda": false,
  "tempMinCritica": -18.0,
  "tempMaxCritica": -15.0
}
```
* **Response 404 (Not Found):** Especie no encontrada.

### `POST` http://localhost:8080/api/v1/especies
Registra una nueva especie en el sistema.

* **Autenticación:** Requerida (`ROLE_ADMIN`)
* **Request Body:**
```json
{
  "nombreComun": "Pez Espada",
  "nombreCientifico": "Xiphias gladius",
  "codigoSanipes": "ESP-009",
  "enVeda": false,
  "tempMinCritica": -20.0,
  "tempMaxCritica": -15.0
}
```
* **Response 201 (Created):** Retorna la especie guardada con su identificador generado.

### `PUT` http://localhost:8080/api/v1/especies/{id}
Actualiza los datos de una especie existente.

* **Autenticación:** Requerida (`ROLE_ADMIN`)
* **Request Body:**
```json
{
  "nombreComun": "Pota Gigante",
  "nombreCientifico": "Dosidicus gigas",
  "codigoSanipes": "ESP-001",
  "enVeda": false,
  "tempMinCritica": -18.0,
  "tempMaxCritica": -14.0
}
```
* **Response 200 (OK):** Especie modificada con éxito.

### `DELETE` http://localhost:8080/api/v1/especies/{id}
Elimina físicamente una especie por su identificador.

* **Autenticación:** Requerida (`ROLE_ADMIN`)
* **Response 204 (No Content):** Eliminado correctamente.

---

## 🚢 Lotes CHD (LotePescaService — Adapter SIP Legacy)

### `GET` http://localhost:8080/api/v1/adaptadores/sip/lotes
Obtiene todos los lotes de pesca CHD registrados en el formato de DTO canónico.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
[
  {
    "id": 1,
    "especie": "Pota",
    "codigoSanipesEspecie": "ESP-001",
    "embarcacion": "San Pedro I",
    "pesoKg": 1500.0,
    "fechaRecepcion": "2026-05-17T20:30:19.013291",
    "estadoSanipes": "APROBADO",
    "estadoFrio": "OK",
    "estadoGeneral": "APTO"
  }
]
```

### `GET` http://localhost:8080/api/v1/adaptadores/sip/lotes/{id}
Obtiene los detalles en formato DTO canónico de un lote por su identificador.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
{
  "id": 1,
  "especie": "Pota",
  "codigoSanipesEspecie": "ESP-001",
  "embarcacion": "San Pedro I",
  "pesoKg": 1500.0,
  "fechaRecepcion": "2026-05-17T20:30:19.013291",
  "estadoSanipes": "APROBADO",
  "estadoFrio": "OK",
  "estadoGeneral": "APTO"
}
```
* **Response 404 (Not Found):** Lote no encontrado.

### `POST` http://localhost:8080/api/v1/adaptadores/sip/lotes
Registra un nuevo lote de pesca CHD heredado desde el sistema SIP. El sistema valida si la especie del lote está bajo periodo de veda activa.

* **Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_LOGISTICA`)
* **Request Body:**
```json
{
  "especie": {
    "id": 1
  },
  "embarcacion": "Nueva Embarcacion Test",
  "pesoKg": 2500.0,
  "estadoSanipes": "PENDIENTE",
  "estadoFrio": "OK",
  "estadoGeneral": "PENDIENTE"
}
```
* **Response 201 (Created):**
```json
{
  "id": 20,
  "especie": {
    "id": 1,
    "nombreComun": "Pota",
    "nombreCientifico": "Dosidicus gigas",
    "codigoSanipes": "ESP-001",
    "enVeda": false,
    "tempMinCritica": -18.0,
    "tempMaxCritica": -15.0
  },
  "embarcacion": "Nueva Embarcacion Test",
  "pesoKg": 2500.0,
  "fechaRecepcion": null,
  "estadoSanipes": "PENDIENTE",
  "estadoFrio": "OK",
  "estadoGeneral": "PENDIENTE"
}
```

> [!WARNING]
> Si la especie se encuentra en periodo de veda, la petición fallará inmediatamente.
> **Response 400 (Bad Request - Veda Activa):**
> ```json
> {
>   "error": "Bad Request",
>   "message": "No se puede registrar el lote: La especie 'Anchoveta' se encuentra en veda.",
>   "status": 400
> }
> ```

### `PUT` http://localhost:8080/api/v1/adaptadores/sip/lotes/{id}/estado
Actualiza el estado general de un lote.

* **Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_CALIDAD`)
* **Query Parameter:** `estadoGeneral` (valores posibles: `APTO`, `NO_APTO`, `PENDIENTE`)
* **Response 200 (OK):** Retorna la entidad del lote actualizada.

---

## Auditorías de Calidad (AuditoriaCalidadService — QualityTrac)

### `POST` http://localhost:8080/api/v1/auditorias
Registra una auditoría de temperatura. El sistema verifica si la temperatura medida se encuentra dentro de los parámetros críticos del rango térmico de la especie. Si es fuera de rango, altera el estado de frío del lote a `"ALERTA"`.

* **Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_CALIDAD`)
* **Request Body:**
```json
{
  "lote": {
    "id": 6
  },
  "inspectorNombre": "Carlos Quispe",
  "temperaturaC": -17.0,
  "observaciones": "Temperatura estable"
}
```
* **Response 201 (Created):**
```json
{
  "id": 30,
  "lote": {
    "id": 6,
    "especie": {
      "id": 2,
      "nombreComun": "Perico",
      "nombreCientifico": "Coryphaena hippurus",
      "codigoSanipes": "ESP-002",
      "enVeda": false,
      "tempMinCritica": -18.0,
      "tempMaxCritica": -14.0
    },
    "embarcacion": "Luz Marina",
    "pesoKg": 800.0,
    "fechaRecepcion": "2026-05-26T20:30:19.051587",
    "estadoSanipes": "APROBADO",
    "estadoFrio": "OK",
    "estadoGeneral": "APTO"
  },
  "inspectorNombre": "Carlos Quispe",
  "timestampMedicion": "2026-05-27T20:33:59.3656216",
  "temperaturaC": -17.0,
  "observaciones": "Temperatura stable",
  "dentroRango": true
}
```

### `GET` http://localhost:8080/api/v1/auditorias/lote/{idLote}
Recupera el historial de auditorías de temperatura registradas para un lote en específico.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
[
  {
    "id": 1,
    "inspectorNombre": "Carlos Quispe",
    "timestampMedicion": "2026-05-27T20:30:19.123456",
    "temperaturaC": -16.5,
    "observaciones": "Temperatura óptima",
    "dentroRango": true
  }
]
```

---

## Orquestación SOA (TramiteSanipesService — ESB WSO2 simulado)

### `POST` http://localhost:8080/api/v1/orch/sanipes-check/{idLote}
Orquesta la verificación de aptitud e inicia formalmente el trámite de certificación SANIPES. El servicio valida que la cadena de frío esté en `"OK"`. Si cumple, genera un código y URL de certificado de manera simulada y actualiza el lote a `"APTO"` / `"APROBADO"`.

* **Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_LOGISTICA`)
* **Response 200 (OK):**
```json
{
  "id": 13,
  "idLote": 6,
  "estado": "APROBADO",
  "codigoCertificado": "492f41f7-a999-4b50-971b-fd99ad7da053",
  "urlCertificado": "https://sanipes.gob.pe/certificados/492f41f7-a999-4b50-971b-fd99ad7da053",
  "fechaSolicitud": "2026-05-27T20:33:59.2799163"
}
```

> [!CAUTION]
> Si la cadena de frío está alterada (`ALERTA`), el trámite será rechazado por el orquestador.
> **Response 400 (Bad Request):**
> ```json
> {
>   "error": "Bad Request",
>   "message": "No se puede iniciar trámite SANIPES: La cadena de frío no está en estado OK. Estado actual: ALERTA",
>   "status": 400
> }
> ```

### `GET` http://localhost:8080/api/v1/orch/expediente-certificado/{idLote}
Recupera el expediente o trámite SANIPES correspondiente a un lote.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
{
  "id": 1,
  "idLote": 1,
  "estado": "APROBADO",
  "codigoCertificado": "CERT-SANIPES-2024-1001",
  "urlCertificado": "https://sanipes.gob.pe/certificados/CERT-SANIPES-2024-1001",
  "fechaSolicitud": "2026-05-18T00:30:19.013291"
}
```

### `GET` http://localhost:8080/api/v1/orch/estado-integral/{idLote}
Retorna el estado del lote en formato DTO canónico con todas las banderas de trazabilidad unificadas.

* **Autenticación:** Requerida (Cualquier Rol)
* **Response 200 (OK):**
```json
{
  "id": 1,
  "especie": "Pota",
  "codigoSanipesEspecie": "ESP-001",
  "embarcacion": "San Pedro I",
  "pesoKg": 1500.0,
  "fechaRecepcion": "2026-05-17T20:30:19.013291",
  "estadoSanipes": "APROBADO",
  "estadoFrio": "OK",
  "estadoGeneral": "APTO"
}
```

---

## Códigos de Error Globales

| Código HTTP | Significado | Causa Común |
|---|---|---|
| **200** | OK | Petición completada con éxito. |
| **201** | Created | Recurso creado exitosamente (lotes, auditorías, etc). |
| **400** | Bad Request | Error de validación de negocio (veda activa, cadena de frío rota). |
| **401** | Unauthorized | Token JWT ausente, expirado o con firma incorrecta. |
| **403** | Forbidden | El rol del usuario no tiene permisos suficientes para el endpoint. |
| **404** | Not Found | El recurso con el ID solicitado no existe en base de datos. |
| **500** | Internal Error | Error no controlado en la lógica del servidor. |

---

## Flujo de Uso Recomendado (Happy Path)

```mermaid
graph TD
    A[POST /auth/login] -->|Obtener Token| B[GET /especies]
    B -->|Elegir Especie Libre| C[POST /adaptadores/sip/lotes]
    C -->|Registrar Lote CHD| D[POST /auditorias]
    D -->|Auditar Temperatura OK| E[POST /orch/sanipes-check/{id}]
    E -->|Solicitar Certificado| F[GET /orch/expediente-certificado/{id}]
```

1. **POST** `/auth/login` → Obtener token JWT.
2. **GET** `/especies` → Revisar especies disponibles y sus estados de veda.
3. **POST** `/adaptadores/sip/lotes` → Registrar lote (se valida que no esté en veda).
4. **POST** `/auditorias` → Registrar mediciones de temperatura del lote (dentro del rango térmico).
5. **POST** `/orch/sanipes-check/{id}` → Solicitar la certificación y aprobación a SANIPES.
6. **GET** `/orch/expediente-certificado/{id}` → Obtener el expediente final con código y URL.
