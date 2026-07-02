# Cumplimiento del sílabo: Arquitectura Orientada al Servicio (100000S08I)

## Resumen ejecutivo
ExporTrace Ica alcanza un nivel de cumplimiento alto respecto al sílabo. La base práctica del curso está cubierta con una arquitectura orientada a servicios compuesta por API Gateway, microservicios, autenticación JWT, consumo REST/JSON, desacoplamiento por dominio y un flujo de certificación orquestado.

Ademas, el sistema ahora incluye una vista especifica de Arquitectura SOA que documenta el inventario de servicios, el flujo orquestado y la trazabilidad de negocio, lo que acerca mas el software al lenguaje y a las ideas del silabo.

El sistema además resuelve el caso de negocio pesquero con trazabilidad realista: lotes, especies, cadena de frío, inspección de temperatura, expediente, certificación y ahora también embarcación y empresa con matrícula, capitán, razón social y RUC. Eso lo acerca mucho más a un escenario empresarial defendible ante el docente.

## Aspectos del sílabo que sí cumple

### 1. Fundamentos de SOA
- El sistema está organizado como una arquitectura orientada a servicios.
- Usa API Gateway como punto único de entrada.
- Tiene microservicios separados para autenticación, lotes, monitoreo de temperatura y certificación.
- Cada servicio mantiene su propia base de datos, lo que refuerza el desacoplamiento.
- Hay separación clara por responsabilidades de negocio y una integración coherente entre servicios.

### 2. Diseño y arquitectura SOA
- La solución separa responsabilidades por dominio funcional.
- El servicio de certificación actúa como orquestador entre lote y monitoreo de frío.
- El frontend consume servicios independientes sin acoplar la lógica de negocio a un solo backend.
- Se aplican patrones de integración vía REST.
- El diseño encaja con una arquitectura distribuida moderna alineada al enfoque del curso.
- Existe una vista funcional de Arquitectura SOA con inventario de servicios, flujo de proceso y relación con las unidades del curso.

### 3. Programación distribuida
- Los módulos del backend se comunican entre sí mediante llamadas HTTP.
- El sistema distribuye responsabilidades entre servicios independientes.
- Existe consumo de servicios externos internos para obtener lotes, temperatura y expediente.
- El gateway y los servicios trabajan como una plataforma distribuida completa.

### 4. Administración de procesos
- El flujo de certificación simula un proceso de negocio completo: recepción del lote, control de temperatura, validación de cadena de frío y emisión del certificado.
- Se mantiene historial de temperaturas y estado de cadena de frío.
- El expediente final integra información del lote, resumen térmico y trámite SANIPES.
- Aunque no existe un BPM formal modelado con notación específica, el proceso de negocio sí está implementado funcionalmente.

### 5. Seguridad y roles
- Hay autenticación con JWT.
- Existen roles diferenciados: ADMIN, QA, LOGISTICA y TI.
- El acceso a módulos del frontend está condicionado por rol.
- El middleware del backend refuerza restricciones por ruta.
- La separación de permisos apoya el enfoque empresarial y de control del sistema.

### 6. Interoperabilidad y servicios web
- El sistema expone y consume endpoints REST.
- Se intercambia información estructurada en JSON.
- El gateway centraliza la integración entre servicios.
- La interoperabilidad está resuelta de forma práctica aunque no con contratos SOAP/WSDL.

### 7. Enfoque empresarial y trazabilidad
- El sistema aborda un caso real de negocio pesquero y exportación.
- Registra lotes, especies, temperatura, certificación y QR de expediente.
- Ahora incluye más información de embarcaciones y empresa para trazabilidad operativa.
- La trazabilidad del lote quedó más sólida para justificar la solución ante un jurado o docente.

## Matriz de alineación por unidad

### Unidad 1: Fundamentos de las arquitecturas orientadas al servicio
Cumplimiento alto.
- Se explica y materializa el enfoque SOA mediante microservicios, gateway y desacoplamiento.
- Hay orientación a servicios, interoperabilidad y separación de responsabilidades.
- Se cubren seguridad, sincronismo/asincronismo a nivel práctico y conceptos de servicios en la implementación.

### Unidad 2: Diseño y arquitectura SOA
Cumplimiento alto.
- La solución define un inventario funcional claro: autenticación, lotes, calidad y certificación.
- Existe composición de servicios entre lote y monitoreo de frío.
- La certificación actúa como punto de orquestación funcional del proceso.
- La nueva vista de Arquitectura SOA hace visible esta composicion dentro del propio software.

### Unidad 3: Programación distribuida y administración de procesos
Cumplimiento medio-alto.
- La programación distribuida está presente en la comunicación entre servicios.
- La administración de procesos está implementada como flujo real de negocio.
- BPM, ESB y UDDI no están modelados de forma formal, pero el proceso operativo sí está resuelto.
- La pantalla de Arquitectura SOA ayuda a explicar el proceso y la orquestacion, aunque no reemplaza un BPM formal.

## Qué se reforzó para alinearlo mejor al pedido del profesor
- Se agregó matrícula de embarcación.
- Se agregó capitán de la embarcación.
- Se agregó razón social de la empresa.
- Se agregó RUC de la empresa.
- Esa información se ve en el alta de lotes, listado, detalle, dashboard, registro de temperatura y expediente.
- Esto mejora la trazabilidad y hace más defendible el alcance académico del sistema.
- Se agregó una página de Arquitectura SOA que muestra el mapa de servicios y el flujo de proceso.

## Aspectos del sílabo que solo cumple parcialmente
- El sílabo menciona conceptos como UDDI, WSDL, SOAP, XML Schema, XQuery, XSLT y BPM formal.
- El sistema actual usa REST/JSON y no implementa un registry de servicios tipo UDDI.
- No hay una capa BPM completa con modelado explícito de procesos de negocio.
- No existe un ESB tradicional; la integración se resuelve con gateway y REST.

## Veredicto final
Sí se puede defender que ExporTrace Ica cumple el sílabo en su parte central y práctica, y ahora quedó más cercano al perfil académico pedido por el profesor gracias a la ampliación de trazabilidad de embarcación y empresa.

No obstante, no sería correcto afirmar que cubre el 100% literal del temario teórico sin agregar piezas específicas de SOAP/WSDL/UDDI/BPM/XML avanzados. En una defensa académica, la formulación más sólida es decir que el software cumple funcionalmente el núcleo del curso y que solo conserva brechas teóricas puntuales, aun cuando ya quedo bastante mas cercano al silabo que al inicio.
