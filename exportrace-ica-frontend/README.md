# ExporTrace ICA Frontend

Frontend PWA para la suite ExporTrace ICA — Exportadora San Andrés (ExporSan), Pisco, Perú.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes base)
- **Zustand** (estado global)
- **React Hook Form + Zod** (formularios)
- **Recharts** (gráficos)
- **Axios** (HTTP)
- **Sonner** (toasts)
- **QRCode.react** (códigos QR)
- **next-pwa** (PWA)

## Instalación

```bash
cd exportrace-ica-frontend
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Credenciales de prueba

| Usuario   | Password     | Rol       |
|-----------|-------------|-----------|
| admin     | admin123    | ADMIN     |
| calidad   | calidad123  | QA        |
| logistica | logistica123| LOGISTICA |

## Backend

El frontend se conecta al API Gateway en `http://localhost:8080`.

Para levantar el backend:

```bash
cd ../exportrace-ica-backend
mvn clean install -DskipTests
# Iniciar MySQL y luego cada servicio por separado
```

## PWA

La app es instalable como PWA en Android (Chrome) e iOS (Safari):

1. Abrir en el navegador móvil
2. En Android: tocar "Agregar a pantalla principal"
3. En iOS: tocar el botón Compartir → "Agregar a pantalla de inicio"

## Estructura

```
app/
├── login/              → Página de login
├── dashboard/          → Layout con Sidebar + Topbar + MobileNav
│   ├── page.tsx        → Dashboard principal
│   ├── lotes/          → CRUD de lotes
│   ├── calidad/        → Auditorías de temperatura
│   ├── certificaciones/→ Trámites SANIPES y expedientes
│   ├── especies/       → Gestión de especies (Admin)
│   └── usuarios/       → Lista de usuarios (Admin)
├── offline/            → Página sin conexión PWA
└── layout.tsx          → Layout raíz
```

## Capturas de pantalla

### Desktop
- **Login**: Formulario centrado con logo y credenciales de prueba
- **Dashboard**: Stats cards + tabla de lotes recientes + alertas activas
- **Lotes**: Tabla con filtros y búsqueda
- **Detalle Lote**: Header + gráfico de temperaturas + sección certificación
- **Certificaciones**: Tabla con todos los lotes y su estado de certificación
- **Expediente**: Tarjeta imprimible con datos, resumen frío, certificado y QR

### Mobile
- **Bottom nav**: 5 íconos de navegación en la parte inferior
- **Sidebar oculta**: Menú hamburguesa con drawer
