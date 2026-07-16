import { Router } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../db';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router(); router.use(authenticate);
router.get('/', asyncHandler(async (_req, res) => res.json(await prisma.medicalRecord.findMany({ take: 50, orderBy: { visitDate: 'desc' }, include: { patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } }, author: { select: { firstName: true, lastName: true } } } }))));
router.get('/:id', asyncHandler(async (req, res) => {
  const record = await prisma.medicalRecord.findUnique({ where: { id: String(req.params.id) }, include: { patient: true, author: { select: { firstName: true, lastName: true } }, prescriptions: true } });
  if (!record) return res.status(404).json({ message: 'Medical record not found' }); res.json(record);
}));
router.put('/:id', authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE), asyncHandler(async (req, res) => {
  const { chiefComplaint, diagnosis, notes, vitalSigns, visitDate } = req.body;
  res.json(await prisma.medicalRecord.update({ where: { id: String(req.params.id) }, data: { chiefComplaint, diagnosis, notes, vitalSigns, ...(visitDate && { visitDate: new Date(visitDate) }) } }));
}));
router.post('/:id/prescriptions', authorize(Role.ADMIN, Role.DOCTOR), asyncHandler(async (req, res) => {
  const { medication, dosage, frequency, duration, instructions } = req.body;
  if (!medication || !dosage || !frequency || !duration) return res.status(400).json({ message: 'Medication, dosage, frequency, and duration are required' });
  res.status(201).json(await prisma.prescription.create({ data: { recordId: String(req.params.id), medication, dosage, frequency, duration, instructions } }));
}));
export default router;
