import { Router } from 'express';
import { AppointmentStatus, Role } from '@prisma/client';
import { prisma } from '../db';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { audit } from '../utils/audit';

const router = Router(); router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  const status = Object.values(AppointmentStatus).includes(req.query.status as AppointmentStatus) ? req.query.status as AppointmentStatus : undefined;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined, to = req.query.to ? new Date(String(req.query.to)) : undefined;
  res.json(await prisma.appointment.findMany({ where: { status, ...(from || to ? { scheduledAt: { gte: from, lte: to } } : {}) }, include: { patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } }, clinician: { select: { firstName: true, lastName: true } } }, orderBy: { scheduledAt: 'asc' } }));
}));
router.post('/', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST), asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.create({ data: { patientId: req.body.patientId, clinicianId: req.body.clinicianId || null, scheduledAt: new Date(req.body.scheduledAt), durationMinutes: Number(req.body.durationMinutes) || 30, reason: req.body.reason, status: req.body.status || AppointmentStatus.PENDING, notes: req.body.notes }, include: { patient: true, clinician: true } });
  await audit(req.user?.id, 'APPOINTMENT_CREATED', 'Appointment', appointment.id);
  res.status(201).json(appointment);
}));
router.put('/:id', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST), asyncHandler(async (req, res) => {
  const data = { ...req.body }; delete data.id; delete data.patient; delete data.clinician; delete data.createdAt; delete data.updatedAt;
  if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt); if (data.durationMinutes) data.durationMinutes = Number(data.durationMinutes);
  res.json(await prisma.appointment.update({ where: { id: String(req.params.id) }, data }));
}));
router.delete('/:id', authorize(Role.ADMIN, Role.RECEPTIONIST), asyncHandler(async (req, res) => { await prisma.appointment.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); }));
export default router;
