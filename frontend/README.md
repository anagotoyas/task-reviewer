# MySpace Frontend

Interfaz web de la plataforma educativa MySpace.

## Requisitos

- Node.js >= 20
- pnpm >= 9
- Backend corriendo en `http://localhost:3000`

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api

# 3. Arrancar en desarrollo
pnpm dev
```

La app estará en `http://localhost:5173`.

## Estructura

- `src/app/` — Router y providers globales
- `src/features/` — Features autocontenidas (auth, users, courses, etc.)
- `src/components/shared/` — Componentes compartidos (AppLayout, NavbarContent, ProtectedRoute)
- `src/lib/` — Axios client, React Query client, theme, utils
- `src/types/` — Tipos de dominio compartidos

## Roles

- **Admin** → `/admin/users`, `/admin/courses`
- **Teacher** → `/teacher/courses`, `/teacher/rubrics`, `/teacher/homeworks`, `/teacher/submissions`
- **Student** → `/student/courses`, `/student/homeworks`, `/student/submissions`
