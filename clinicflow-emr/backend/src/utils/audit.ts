import { prisma } from '../db';

export async function audit(userId: string | undefined, action: string, entity: string, entityId?: string, details?: object) {
  await prisma.auditLog.create({ data: { userId, action, entity, entityId, details } });
}

