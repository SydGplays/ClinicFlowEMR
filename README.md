# ClinicFlow EMR

ClinicFlow EMR is a full-stack electronic medical records management system created as a portfolio project. It demonstrates patient administration, clinical documentation, appointment scheduling, role-based access control, dashboard analytics, and audit logging.

> **Important:** This application uses fictional demo data only. It must never be used to store real patient information or protected health information. It is not certified for clinical use.

## Features

- JWT authentication
- Role-based authorization
- User and role management
- Patient directory with search and filters
- Patient profile and clinical timeline
- Medical records and clinical notes
- Prescriptions and allergies
- Appointment scheduling and status filtering
- Dashboard statistics
- Basic audit logs
- Responsive hospital dashboard interface
- Loading, empty, and error states

## User Roles

| Role | Main permissions |
|---|---|
| `ADMIN` | Full access, user management, patient deletion, and audit logs |
| `DOCTOR` | Medical records, prescriptions, allergies, and appointments |
| `NURSE` | Medical records, allergies, patients, and appointments |
| `RECEPTIONIST` | Patient registration and appointment scheduling |

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JSON Web Tokens
- bcrypt
- dotenv
- cors
- helmet
- Morgan

## Project Structure

```text
clinicflow-emr/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Data Models

- User
- Patient
- MedicalRecord
- Prescription
- Allergy
- Appointment
- AuditLog

All primary keys use UUIDs.

## Getting Started

### Requirements

Install the following software:

- Node.js 20 or newer
- npm
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ClinicFlowEMR.git
cd ClinicFlowEMR/clinicflow-emr
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Start PostgreSQL

Make sure Docker Desktop is running:

```bash
docker compose up -d
```

### 3. Configure the backend

```bash
cd backend
```

Copy the environment example:

```powershell
Copy-Item .env.example .env
```

Review `backend/.env` and set a secure local JWT secret.

Install dependencies and prepare the database:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

The API will run at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

If Vite encounters a Windows configuration permission error, use:

```bash
npx vite --configLoader runner --host 0.0.0.0
```

Open:

```text
http://localhost:5173
```

## Demo Credentials

```text
Email: admin@clinicflow.demo
Password: Demo123!
```

Additional fictional accounts are created by the database seed for the `DOCTOR`, `NURSE`, and `RECEPTIONIST` roles.

## Main API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Patients

```text
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### Medical Records

```text
GET  /api/patients/:id/records
POST /api/patients/:id/records
GET  /api/records/:id
PUT  /api/records/:id
```

### Prescriptions and Allergies

```text
POST   /api/records/:id/prescriptions
POST   /api/patients/:id/allergies
DELETE /api/allergies/:id
```

### Appointments

```text
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Dashboard and Administration

```text
GET /api/dashboard/stats
GET /api/users
GET /api/audit-logs
```

## Security Notes

- Passwords are hashed with bcrypt.
- Protected endpoints require a valid JWT.
- Sensitive actions use role-based authorization.
- Helmet configures security-related HTTP headers.
- CORS restricts browser access to the configured frontend origin.
- `.env` files are excluded from Git.
- Only `.env.example` files should be committed.
- All included records are fictional.

## Audit Events

The application records audit events for:

- Successful login
- Patient creation
- Patient updates
- Medical record creation
- Appointment creation
- User creation
- Patient deletion

## Build

Build each application independently:

```bash
cd backend
npm run build
```

```bash
cd frontend
npm run build
```

## Portfolio Disclaimer

ClinicFlow EMR is an educational portfolio project. It is not a production medical device, does not provide medical advice, and is not designed to satisfy healthcare compliance requirements without additional security, legal, infrastructure, and regulatory work.

## Author

Developed by **SydGplays** as a full-stack portfolio project.

## License

This project is available for portfolio and educational purposes.
