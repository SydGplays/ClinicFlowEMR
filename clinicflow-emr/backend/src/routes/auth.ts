import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../db';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import { audit } from '../utils/audit';

const router = Router();
const publicUser = { id: true, firstName: true, lastName: true, email: true, role: true, active: true, createdAt: true } as const;

router.post('/register', authenticate, authorize(Role.ADMIN), asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = Role.RECEPTIONIST } = req.body;
  if (!firstName || !lastName || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and password of at least 8 characters are required' });
  if (!Object.values(Role).includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await prisma.user.create({ data: { firstName, lastName, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role }, select: publicUser });
  await audit(req.user?.id, 'USER_CREATED', 'User', user.id, { role: user.role });
  res.status(201).json(user);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: String(req.body.email ?? '').toLowerCase() } });
  if (!user || !user.active || !(await bcrypt.compare(String(req.body.password ?? ''), user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as SignOptions);
  await audit(user.id, 'LOGIN', 'User', user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: publicUser });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

export default router;

