# Employee Management System (Full Stack)

Modern, session-based Employee Management System with a clean corporate HR dashboard UI.

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Axios (with cookies / sessions)
- React Router

**Backend**
- Java + Spring Boot `4.0.3`
- Spring Security (session-based, no JWT)
- Spring Data JPA (Hibernate)
- Bean validation (`@Valid`)
- Global exception handler + logging

**Database**
- PostgreSQL (Supabase or local)
- Credentials via environment variables

---

## Project Structure

- `ems-backend/` — Spring Boot REST API
- `ems-frontend/` — React dashboard

---

## Backend Setup (Spring Boot)

### 1) Configure environment variables

Required (Supabase):
- `DB_URL` (example: `jdbc:postgresql://<host>:5432/postgres?sslmode=require`)
- `DB_USERNAME`
- `DB_PASSWORD`

Optional:
- `APP_CORS_ORIGINS` (default: `http://localhost:5173`)
- `APP_ADMIN_EMAIL` (default: `admin@ems.local`)
- `APP_ADMIN_PASSWORD` (default: `Admin@1234`)

### 2) Run the backend

PowerShell:
```powershell
cd ems-backend
$env:DB_URL="jdbc:postgresql://localhost:5432/ems"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

### Default admin (created at startup)
- Email: `admin@ems.local`
- Password: `Admin@1234`

---

## Frontend Setup (React)

### 1) Configure `.env`

Create `ems-frontend/.env` from `ems-frontend/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2) Run the frontend

```powershell
cd ems-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Auth Flow (Session-Based)

- Frontend calls `POST /api/auth/login` with email/password.
- Backend creates/uses an HTTP session; frontend sends cookies automatically (`withCredentials: true`).
- Frontend auto-checks existing sessions via `GET /api/auth/me`.
- Logout via `POST /api/auth/logout`.

---

## Core API Endpoints

**Auth**
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

**Employees**
- `GET /api/employees?page=&size=&sortBy=&dir=&search=&departmentId=`
- `GET /api/employees/{id}`
- `POST /api/employees`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}` (soft delete)

**Departments**
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`

**Dashboard**
- `GET /api/dashboard/summary`

---

## Notes

- When creating an employee, you can optionally provide a `password`. If omitted, the backend auto-generates one and returns it once in the create response.
- Department deletion is blocked if it still has (non-deleted) employees. Reassign employees first.

