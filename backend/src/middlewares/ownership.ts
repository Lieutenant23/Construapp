import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

export async function ensureProjectOwner(req: AuthRequest, res: Response, next: NextFunction) {
  const id = Number(req.params.id || req.params.projectId);
  if (!req.userId) return res.status(401).json({ message: 'Não autenticado' });
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== req.userId) {
    return res.status(403).json({ message: 'Sem permissão' });
  }
  (req as any).project = project;
  next();
}

export async function ensureExpenseOwner(req: AuthRequest, res: Response, next: NextFunction) {
  const id = Number(req.params.id || req.params.expenseId);
  if (!req.userId) return res.status(401).json({ message: 'Não autenticado' });
  const expense = await prisma.expense.findUnique({ where: { id }, include: { project: true } });
  if (!expense || expense.project.userId !== req.userId) {
    return res.status(403).json({ message: 'Sem permissão' });
  }
  (req as any).expense = expense;
  next();
}