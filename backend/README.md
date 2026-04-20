# MySpace Backend

API REST educativa para evaluación de videos con rúbricas.

## Requisitos

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 15

## Setup

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 3. Generar cliente Prisma y correr migración

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

> Cuando pregunte por el nombre de la migración, pon: `init`

### 4. Ejecutar seed (roles + admin inicial)

```bash
pnpm seed
```

### 5. Arrancar en desarrollo

```bash
pnpm start:dev
```

La API estará disponible en `http://localhost:3000/api`

## Endpoints principales

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | /api/auth/login | Público | Login |
| POST | /api/auth/refresh | Autenticado | Renovar tokens |
| POST | /api/auth/logout | Autenticado | Logout |
| GET | /api/roles | Admin | Listar roles |
| POST | /api/users | Admin | Crear usuario |
| GET | /api/users | Admin | Listar usuarios |
| GET | /api/users/:id | Admin | Ver usuario |
| PATCH | /api/users/:id | Admin | Editar usuario |
| DELETE | /api/users/:id | Admin | Eliminar usuario |
| POST | /api/courses | Admin | Crear curso |
| GET | /api/courses | Todos | Listar cursos (filtrado por rol) |
| GET | /api/courses/:id | Todos | Ver curso |
| PATCH | /api/courses/:id | Admin | Editar curso |
| DELETE | /api/courses/:id | Admin | Eliminar curso |
| POST | /api/courses/:id/students | Admin | Asignar estudiantes |
| POST | /api/rubrics | Teacher | Crear rúbrica |
| GET | /api/rubrics | Teacher | Listar mis rúbricas |
| GET | /api/rubrics/:id | Teacher | Ver rúbrica |
| PATCH | /api/rubrics/:id | Teacher | Editar rúbrica |
| DELETE | /api/rubrics/:id | Teacher | Eliminar rúbrica |
| POST | /api/homeworks | Teacher | Crear tarea |
| GET | /api/homeworks | Todos | Listar tareas |
| GET | /api/homeworks/:id | Todos | Ver tarea |
| PATCH | /api/homeworks/:id | Teacher | Editar tarea |
| DELETE | /api/homeworks/:id | Teacher | Eliminar tarea |
| POST | /api/homeworks/:id/groups | Teacher | Crear grupo |
| GET | /api/homeworks/:id/groups | Teacher/Student | Ver grupos |
| POST | /api/submissions | Student | Subir entrega |
| GET | /api/submissions | Todos | Listar entregas |
| GET | /api/submissions/:id | Todos | Ver entrega |
| POST | /api/submissions/:id/start-review | Teacher | Iniciar revisión |
| PATCH | /api/submissions/:id/review | Teacher | Confirmar notas |
