import { Router } from 'express';
import { Gender, Role } from '@prisma/client';
import { prisma } from '../db';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { audit } from '../utils/audit';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const search = String(req.query.search ?? '').trim();
  const gender = Object.values(Gender).includes(req.query.gender as Gender) ? req.query.gender as Gender : undefined;
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const where = { gender, ...(search && { OR: [
    { firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } },
    { medicalRecordNumber: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } },
  ] }) };
  const [items, total] = await prisma.$transaction([prisma.patient.findMany({ where, orderBy: { lastName: 'asc' }, skip: (page - 1) * limit, take: limit }), prisma.patient.count({ where })]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { id: String(req.params.id) }, include: { allergies: { orderBy: { createdAt: 'desc' } }, appointments: { orderBy: { scheduledAt: 'desc' }, take: 10 }, records: { include: { author: { select: { firstName: true, lastName: true } }, prescriptions: true }, orderBy: { visitDate: 'desc' } } } });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
}));

router.post('/', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST), asyncHandler(async (req, res) => {
  const { medicalRecordNumber, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact } = req.body;
  if (!medicalRecordNumber || !firstName || !lastName || !dateOfBirth || !Object.values(Gender).includes(gender)) return res.status(400).json({ message: 'Medical record number, name, date of birth, and valid gender are required' });
  const patient = await prisma.patient.create({ data: { medicalRecordNumber, firstName, lastName, dateOfBirth: new Date(dateOfBirth), gender, phone, email, address, emergencyContact } });
  await audit(req.user?.id, 'PATIENT_CREATED', 'Patient', patient.id);
  res.status(201).json(patient);
}));

router.put('/:id', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST), asyncHandler(async (req, res) => {
  const data = { ...req.body }; delete data.id; delete data.createdAt; delete data.updatedAt; delete data.records; delete data.allergies; delete data.appointments;
  if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
  const patient = await prisma.patient.update({ where: { id: String(req.params.id) }, data });
  await audit(req.user?.id, 'PATIENT_UPDATED', 'Patient', patient.id);
  res.json(patient);
}));

router.delete('/:id', authorize(Role.ADMIN), asyncHandler(async (req, res) => {
  await prisma.patient.delete({ where: { id: String(req.params.id) } });
  await audit(req.user?.id, 'PATIENT_DELETED', 'Patient', String(req.params.id));
  res.status(204).send();
}));

router.get('/:id/records', asyncHandler(async (req, res) => res.json(await prisma.medicalRecord.findMany({ where: { patientId: String(req.params.id) }, include: { author: { select: { firstName: true, lastName: true } }, prescriptions: true }, orderBy: { visitDate: 'desc' } }))));
router.post('/:id/records', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE), asyncHandler(async (req, res) => {
  const { chiefComplaint, diagnosis, notes, visitDate, vitalSigns } = req.body;
  if (!chiefComplaint || !diagnosis || !notes) return res.status(400).json({ message: 'Chief complaint, diagnosis, and notes are required' });
  const record = await prisma.medicalRecord.create({ data: { patientId: String(req.params.id), authorId: req.user!.id, chiefComplaint, diagnosis, notes, vitalSigns, ...(visitDate && { visitDate: new Date(visitDate) }) }, include: { author: { select: { firstName: true, lastName: true } }, prescriptions: true } });
  await audit(req.user?.id, 'MEDICAL_RECORD_CREATED', 'MedicalRecord', record.id, { patientId: String(req.params.id) });
  res.status(201).json(record);
}));
router.post('/:id/allergies', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE), asyncHandler(async (req, res) => {
  const allergy = await prisma.allergy.create({ data: { patientId: String(req.params.id), allergen: req.body.allergen, reaction: req.body.reaction, severity: req.body.severity } });
  res.status(201).json(allergy);
}));

export default router;
