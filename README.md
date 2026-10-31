# GestiStock

Sistema de gestión de inventario multiplataforma (PWA / híbrida) desarrollado con **Ionic 9 + Angular 22** (standalone, zoneless) y **Supabase**.

Actividad individual 1 · Desarrollo de Interfaces (0488) · 2º DAM.

- **Aplicación en producción:** https://gestistock-gamma.vercel.app
- **Repositorio:** https://github.com/Guillermogutierrez-14/gestistock

## Tecnologías

| Necesidad | Herramienta |
| --- | --- |
| Framework | Ionic 9 + Angular 22 (componentes standalone, Signals) |
| Autenticación y roles | Supabase Auth (JWT) + tabla `perfiles` con RLS |
| API REST (SQL) | Supabase PostgREST sobre PostgreSQL |
| Datos NoSQL en tiempo real | Columna JSONB + Supabase Realtime |
| Gráficos | Chart.js |
| Exportación | jsPDF + jspdf-autotable (PDF) y CSV |
| Tests | Vitest |
| Despliegue | Vercel (despliegue automático desde `main`) |

## Arquitectura (MVVM)

```
src/app/
├── core/
│   ├── guards/          authGuard, rolGuard (canMatch), invitadoGuard, cambiosSinGuardarGuard
│   ├── interceptors/    authInterceptor (JWT) y erroresSesionInterceptor (401/403)
│   ├── models/          Producto, Movimiento, Perfil, Rol, Permiso, PERMISOS_POR_ROL
│   ├── routing/         PrecargaSegunRol
│   ├── services/        AuthService, ProductoService, MovimientoService, ExportacionService
│   └── validators/      codigoUnicoValidator (validación asíncrona)
├── pages/               login, inicio, productos, movimientos, nuevo-producto, dashboard, ayuda
└── shared/
    ├── components/      tabla-datos, widget-estadistica, grafico
    └── directives/      *appTieneRol
```

## Instalación en local

1. Requisitos: Node.js 20 o superior.
2. Clona el repositorio e instala las dependencias:
   ```bash
   git clone https://github.com/Guillermogutierrez-14/gestistock.git
   cd gestistock
   npm install
   ```
3. Copia `.env.example` como `.env` y rellena la URL y la clave **pública** (`sb_publishable_…`) de Supabase. El archivo `.env` no se sube a Git.
4. Arranca la aplicación:
   ```bash
   npm start        # http://localhost:4200
   npm test         # tests unitarios
   npm run build    # compilación de producción en www/
   ```

## Manual de usuario

La aplicación incluye este mismo manual en la página **Ayuda** del menú lateral.

### Roles

| Función | Administrador | Usuario estándar |
| --- | :---: | :---: |
| Consultar productos y buscar | ✅ | ✅ |
| Exportar informes PDF / CSV | ✅ | ✅ |
| Ver y registrar movimientos | ✅ | ✅ |
| Dar de alta productos | ✅ | ❌ |
| Cuadro de mando con gráficos | ✅ | ❌ |

### 1. Iniciar sesión
1. Abre la aplicación y escribe tu email y contraseña.
2. Pulsa **Entrar**. Si habías intentado abrir una página concreta, la app te lleva a ella.
3. Si la sesión caduca, la app te avisa y te pide entrar de nuevo.

### 2. Productos
- Las tarjetas superiores muestran el número de productos, los que tienen stock bajo y el valor total del inventario.
- Usa el buscador para filtrar por código, nombre o categoría.
- Pulsa la tarjeta **Stock bajo** para ver solo los productos por debajo del mínimo.
- **Exportar CSV** / **Exportar PDF** descargan un informe con los productos filtrados.

### 3. Movimientos
- Lista de entradas y salidas de stock que se actualiza en tiempo real.
- Rellena el formulario para registrar un movimiento.

### 4. Nuevo producto (solo administrador)
- El código debe tener el formato `ABC-123` y no puede existir ya (se comprueba mientras escribes).
- Si sales con el formulario a medias, la app pide confirmación.

### 5. Cuadro de mando (solo administrador)
- Gráficos de stock por categoría y de movimientos, con filtros que se aplican al momento.

## Seguridad

- Las claves de Supabase se leen de variables de entorno (`.env` en local y *Environment Variables* en Vercel). Solo se usa la clave **pública**; nunca la clave secreta.
- Autenticación con `canActivate` y autorización por rol con `canMatch` (el código de las páginas de administrador no se descarga si el rol no coincide).
- Interceptores HTTP: añaden el token JWT y gestionan los errores 401 (renovación del token) y 403.
- Las políticas RLS de Supabase validan el rol en el servidor.
- `vercel.json` añade cabeceras de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Flujo de trabajo con Git

Git Flow: `main` (producción) ← `develop` (integración) ← ramas `feature/*` y `chore/*`, unidas siempre con Pull Requests.
