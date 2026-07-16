import { AllergySeverity, AppointmentStatus, Gender, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo123!', 12);
  const admin = await prisma.user.create({ data: { firstName: 'Avery', lastName: 'Morgan', email: 'admin@clinicflow.demo', passwordHash, role: Role.ADMIN } });
  const doctor = await prisma.user.create({ data: { firstName: 'Maya', lastName: 'Chen', email: 'doctor@clinicflow.demo', passwordHash, role: Role.DOCTOR } });
  await prisma.user.createMany({ data: [
    { firstName: 'Jordan', lastName: 'Rivera', email: 'nurse@clinicflow.demo', passwordHash, role: Role.NURSE },
    { firstName: 'Taylor', lastName: 'Brooks', email: 'reception@clinicflow.demo', passwordHash, role: Role.RECEPTIONIST },
  ] });

  const patients = await Promise.all([
    prisma.patient.create({ data: { medicalRecordNumber: 'CF-10001', firstName: 'Sam', lastName: 'Park', dateOfBirth: new Date('1988-04-12'), gender: Gender.OTHER, phone: '555-0101', email: 'sam.park@example.test', address: '101 Demo Avenue', emergencyContact: 'Alex Park · 555-0191' } }),
    prisma.patient.create({ data: { medicalRecordNumber: 'CF-10002', firstName: 'Jamie', lastName: 'Lopez', dateOfBirth: new Date('1975-09-23'), gender: Gender.FEMALE, phone: '555-0102', email: 'jamie.lopez@example.test', address: '202 Sample Street' } }),
    prisma.patient.create({ data: { medicalRecordNumber: 'CF-10003', firstName: 'Robin', lastName: 'Singh', dateOfBirth: new Date('1994-01-08'), gender: Gender.MALE, phone: '555-0103', email: 'robin.singh@example.test', address: '303 Prototype Road' } }),
  ]);

  const record = await prisma.medicalRecord.create({ data: { patientId: patients[0].id, authorId: doctor.id, chiefComplaint: 'Seasonal congestion', diagnosis: 'Allergic rhinitis', notes: 'Demo consultation. Hydration and symptom monitoring discussed.', vitalSigns: { bloodPressure: '118/76', temperatureC: 36.7, heartRate: 72 } } });
  await prisma.prescription.create({ data: { recordId: record.id, medication: 'Demo Medication A', dosage: '10 mg', frequency: 'Once daily', duration: '14 days', instructions: 'Portfolio demonstration only; not medical advice.' } });
  await prisma.allergy.create({ data: { patientId: patients[0].id, allergen: 'Demo allergen', reaction: 'Mild rash', severity: AllergySeverity.MILD } });
  await prisma.appointment.createMany({ data: [
    { patientId: patients[1].id, clinicianId: doctor.id, scheduledAt: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine follow-up', status: AppointmentStatus.CONFIRMED },
    { patientId: patients[2].id, clinicianId: doctor.id, scheduledAt: new Date(new Date().setHours(14, 30, 0, 0)), reason: 'Initial consultation', status: AppointmentStatus.PENDING },
  ] });
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'SEED_CREATED', entity: 'System', details: { note: 'Fake portfolio demo data only' } } });
  console.log('Demo seed complete. Login: admin@clinicflow.demo / Demo123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
