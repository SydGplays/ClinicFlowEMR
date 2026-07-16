# ClinicFlow EMR

ClinicFlow EMR is a full-stack portfolio demonstration of a medical records workflow. It manages users, role-based access, patients, clinical records, prescriptions, allergies, appointments, dashboard statistics, and audit events.

> **Safety notice:** All included people, contacts, visits, diagnoses, and medications are fictional. Never use real patient data or protected health information. This project is not certified for clinical use and does not provide medical advice.

## Stack and structure

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, dotenv, cors, helmet, Morgan

```text
clinicflow-emr/
├── frontend/         React application
├── backend/          Express API and Prisma
├── docker-compose.yml
└── README.md
```

## Quick start

Prerequisites: Node.js 20+, npm, and Docker Desktop (or PostgreSQL 16).

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. Demo login: `admin@clinicflow.demo` / `Demo123!`.

Do not commit `.env`. Generate a strong `JWT_SECRET` outside development. The backend defaults are intentionally development-only.

## Roles

- `ADMIN`: full access, user registration, patient deletion, audit logs
- `DOCTOR`: clinical records, prescriptions, allergies, appointments
- `NURSE`: clinical records, allergies, appointments
- `RECEPTIONIST`: patients and appointment scheduling

The registration endpoint is protected and ADMIN-only; it is intended for provisioning team accounts, not public signup.

## API

The API starts at `http://localhost:4000`; health is available at `GET /health`. Authenticated endpoints expect `Authorization: Bearer <token>`.

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Patients: `GET|POST /api/patients`, `GET|PUT|DELETE /api/patients/:id`
- Records: `GET|POST /api/patients/:id/records`, `GET|PUT /api/records/:id`
- Prescriptions/allergies: `POST /api/records/:id/prescriptions`, `POST /api/patients/:id/allergies`, `DELETE /api/allergies/:id`
- Appointments: `GET|POST /api/appointments`, `PUT|DELETE /api/appointments/:id`
- Dashboard: `GET /api/dashboard/stats`
- Administration: `GET /api/users`, `GET /api/audit-logs` (ADMIN)

Patient list query parameters: `search`, `gender`, `page`, `limit`. Appointment query parameters: `from`, `to`, `status`.

## Phase guide

### Phase 1 — Foundation

Files: root Docker Compose and ignore rules; frontend Vite, TypeScript, Tailwind, and PostCSS configuration; backend TypeScript configuration, Express server, environment example, database client, middleware, and `/health`.

Run: `docker compose up -d`, then install dependencies separately inside `frontend` and `backend`. Test `curl http://localhost:4000/health`; expect `{ "status": "ok" }`.

Common fixes: if port 5432 is busy, stop the existing PostgreSQL instance or change both the Docker port and `DATABASE_URL`. If CORS rejects the browser, make `FRONTEND_URL` match the exact Vite origin.

### Phase 2 — Data model

Files: `backend/prisma/schema.prisma`, checked-in initial SQL migration, migration lock, and `seed.ts`. Every entity uses UUIDs; enums cover role, gender, allergy severity, and appointment status.

Run: `npx prisma generate`, `npx prisma migrate deploy`, then `npm run prisma:seed`. Test with `npx prisma studio` and confirm all records are visibly fictional.

Common fixes: `P1001` means PostgreSQL is unreachable; verify `docker compose ps`. If a seed conflicts, the seed intentionally clears and recreates demo rows, so do not run it against valuable data.

### Phase 3 — Authentication

Files: auth routes plus JWT authentication, role authorization, error handling, and audit helpers; frontend auth context, Axios token interceptor, and login page.

Run the API and submit `POST /api/auth/login` with the demo credentials. Test a successful token, `/api/auth/me`, an invalid password (401), missing token (401), and a role mismatch (403).

Common fixes: JWT failures usually mean the API restarted with a different secret or the token expired; sign in again. Bcrypt installation issues require a supported Node.js LTS version.

### Phase 4 — Patients

Files: patient API routes, patient directory page, create modal, protected layout, and patient detail page.

Test create, search by name/MRN/email, filter by gender, edit through the API, open a detail page, and verify only ADMIN can delete. Duplicate MRNs are rejected by PostgreSQL.

Common fixes: a 400 response indicates missing required fields; a 500 containing a unique constraint usually means the MRN already exists.

### Phase 5 — Medical records

Files: nested patient record routes, record routes, consolidated records page, and clinical timeline in patient detail.

Test a DOCTOR or NURSE creating a record, timeline ordering, record detail, and updates. RECEPTIONIST receives 403 for clinical record writes.

Common fixes: the author must be a valid authenticated user and patient IDs must be valid UUIDs.

### Phase 6 — Prescriptions and allergies

Files: prescription and allergy routes and the allergy interface in patient detail. Prescriptions are returned with record timelines.

Test DOCTOR prescription creation, DOCTOR/NURSE allergy creation, and allergy deletion. Required prescription fields are validated.

Common fixes: duplicate allergen names for one patient violate the intended uniqueness rule; update or remove the existing allergy instead.

### Phase 7 — Appointments

Files: appointment CRUD API and schedule page with date/status filters and create modal.

Test create, update status through the API, filter by ISO date range and status, and delete as ADMIN or RECEPTIONIST.

Common fixes: browser `datetime-local` values use local time and are serialized by Axios; ensure server/container timezone expectations match deployment requirements.

### Phase 8 — Dashboard

Files: dashboard statistics route and dashboard page with four live statistic cards and recent records.

Test totals against database rows, today's boundary, current-month consultations, pending count, and links from recent records.

Common fixes: day boundaries are calculated in the API process timezone. Configure the deployment timezone deliberately for production-like environments.

### Phase 9 — Audit logs

Files: audit helper and ADMIN audit endpoint. Login, patient create/update, medical record create, and appointment create events are recorded; extra administrative events are also included.

Test actions and query `GET /api/audit-logs` as ADMIN. Non-admin roles receive 403.

Common fixes: audit creation is part of the request flow, so database errors can fail a write response after the primary row exists. For production, wrap the business write and audit event in one Prisma transaction.

## Build and portfolio checks

Run `npm run build` independently in `backend` and `frontend`. Do not install root-level dependencies and do not copy dependencies between applications.

Before sharing the portfolio:

1. Confirm `.env` is untracked and only `.env.example` exists in source control.
2. Reset with the fictional seed.
3. Test every role and expected 401/403 boundary.
4. Use a non-default JWT secret outside local development.
5. Add validation/rate limiting and compliance review before considering any real-world adaptation.

