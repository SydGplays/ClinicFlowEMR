import { Router } from 'express';
import { Role } from '@prisma/client';
import auth from './auth'; import patients from './patients'; import records from './records'; import appointments from './appointments';
import { authenticate, authorize } from '../middleware/auth'; import { asyncHandler } from '../utils/asyncHandler'; import { prisma } from '../db';

const router = Router();
router.use('/auth', auth); router.use('/patients', patients); router.use('/records', records); router.use('/appointments', appointments);
router.delete('/allergies/:id', authenticate, authorize(Role.ADMIN, Role.DOCTOR, Role.NURSE), asyncHandler(async (req, res) => { await prisma.allergy.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); }));
router.get('/dashboard/stats', authenticate, asyncHandler(async (_req, res) => {
  const now = new Date(), dayStart = new Date(now); dayStart.setHours(0,0,0,0); const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate()+1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [totalPatients, appointmentsToday, monthlyConsultations, pendingAppointments, recentRecords] = await prisma.$transaction([
    prisma.patient.count(), prisma.appointment.count({ where: { scheduledAt: { gte: dayStart, lt: dayEnd } } }), prisma.medicalRecord.count({ where: { visitDate: { gte: monthStart } } }), prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.medicalRecord.findMany({ take: 5, orderBy: { visitDate: 'desc' }, include: { patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } }, author: { select: { firstName: true, lastName: true } } } })
  ]); res.json({ totalPatients, appointmentsToday, monthlyConsultations, pendingAppointments, recentRecords });
}));
router.get('/users', authenticate, authorize(Role.ADMIN), asyncHandler(async (_req, res) => res.json(await prisma.user.findMany({ select: { id:true, firstName:true,lastName:true,email:true,role:true,active:true,createdAt:true }, orderBy:{lastName:'asc'} }))));
router.get('/audit-logs', authenticate, authorize(Role.ADMIN), asyncHandler(async (_req, res) => res.json(await prisma.auditLog.findMany({ take:100, orderBy:{createdAt:'desc'}, include:{user:{select:{firstName:true,lastName:true,email:true}}} }))));
export default router;
