# ⏱ WorkTrack

**WorkTrack** es una aplicación web para contabilizar y gestionar las horas trabajadas en proyectos de ingeniería (u otros rubros), organizadas por documentos y tipos de actividad. Usa **Supabase** como backend en la nube y corre completamente en el navegador, sin necesidad de servidor propio.

---

## 🌟 Funcionalidades

### 📊 Dashboard
- Muestra un **resumen general** con KPIs: total de proyectos, total de documentos y total de horas registradas.
- Lista las tarjetas de todos los proyectos con acceso directo a cada uno.

### 📁 Gestión de Proyectos
- **Listar** todos los proyectos con su código, nombre, cantidad de documentos y horas acumuladas.
- **Crear** un nuevo proyecto con código, nombre y descripción opcional.
- **Editar** los datos de un proyecto existente.
- **Eliminar** un proyecto (elimina en cascada todos sus documentos y registros de horas).

### 📄 Gestión de Documentos
- Desde el detalle de un proyecto puedes **ver todos los documentos** asociados.
- **Crear**, **editar** y **eliminar** documentos, cada uno con código, nombre y descripción.
- Cada documento muestra sus horas totales acumuladas.

### ⏰ Registro de Horas (`time_entries`)
- Dentro de cada documento puedes **registrar entradas de horas** indicando:
  - **Fecha** del trabajo
  - **Actividad** (Diseño, Revisión, Corrección, Documentación, Reunión, Coordinación, u otras personalizadas)
  - **Descripción** opcional de la actividad realizada
  - **Horas** trabajadas (en incrementos de 0.25 h, máximo 24 h por registro)
- **Editar** o **eliminar** cualquier registro existente.
- Vista de tabla con **total de horas** al pie.

### 🔔 UX / Interfaz
- Navegación tipo SPA (Single Page Application) con hash routing.
- Sidebar con navegación a Dashboard y Proyectos.
- Modales para formularios de creación/edición.
- Toast notifications para confirmación de acciones.
- Diálogos de confirmación antes de eliminar.
- Spinner de carga mientras se obtienen datos de Supabase.

---

## 🗂 Estructura del proyecto

```
WORKTRACK/
├── index.html              # Estructura principal (sidebar, main, modal, toasts)
├── config.js               # Credenciales de Supabase (no subir al repo)
├── config.example.js       # Plantilla de configuración
├── css/
│   └── app.css             # Estilos globales
├── js/
│   ├── app.js              # Router principal (hash-based SPA)
│   ├── db.js               # Instancia del cliente Supabase
│   ├── utils.js            # Helpers: toast, modal, formatters, etc.
│   ├── pages/
│   │   ├── dashboard.js        # Página de Dashboard
│   │   ├── projects-page.js    # Listado de Proyectos (CRUD)
│   │   ├── project-detail.js   # Detalle de Proyecto + Documentos (CRUD)
│   │   └── document-detail.js  # Detalle de Documento + Registros de Horas (CRUD)
│   └── services/
│       ├── projects.js         # Operaciones CRUD sobre `projects`
│       ├── documents.js        # Operaciones CRUD sobre `documents`
│       └── time-entries.js     # Operaciones CRUD sobre `time_entries`
└── sql/
    └── setup.sql           # Script SQL para crear tablas en Supabase
```

---

## 🚀 Configuración e instalación

### 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En el **SQL Editor** del dashboard, ejecuta el contenido de `sql/setup.sql`.  
   Esto crea las tablas `projects`, `documents` y `time_entries`, sus índices y las políticas de acceso.

### 2. Configurar credenciales

Copia `config.example.js` a `config.js` y completa tus credenciales:

```js
// config.js
window.WORKTRACK_CONFIG = {
  supabaseUrl: 'https://TU_PROJECT_ID.supabase.co',
  supabaseKey: 'TU_ANON_KEY_AQUI'
};
```

> ⚠️ **No subas `config.js` a un repositorio público.** Agrega `config.js` a tu `.gitignore`.

### 3. Abrir la aplicación

Abre `index.html` directamente en el navegador o sírvela con cualquier servidor estático:

```bash
# Con Python
python -m http.server 8080

# Con Node.js (npx)
npx serve .
```

Luego ve a `http://localhost:8080`.

---

## 🗄 Esquema de base de datos

| Tabla | Campos principales |
|---|---|
| `projects` | `id`, `code`, `name`, `description`, `created_at` |
| `documents` | `id`, `project_id`, `code`, `name`, `description`, `created_at` |
| `time_entries` | `id`, `project_id`, `document_id`, `date`, `activity`, `description`, `hours`, `created_at` |

Las relaciones son `projects → documents → time_entries` con eliminación en cascada.

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 (Vanilla), JavaScript ES Modules |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + REST API) |
| Hosting sugerido | Cualquier hosting estático (GitHub Pages, Netlify, Vercel) |

---

## 📌 Rutas de la aplicación

| Hash | Página |
|---|---|
| `#/` o `#/dashboard` | Dashboard general |
| `#/projects` | Listado de proyectos |
| `#/projects/:id` | Detalle de proyecto y sus documentos |
| `#/projects/:id/documents/:docId` | Detalle de documento y registros de horas |

---

*v1.0 MVP*
