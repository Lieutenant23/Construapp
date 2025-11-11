import { Router, Request, Response } from 'express';
import { PrismaClient, AttachmentTipo } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { ensureProjectOwner, ensureExpenseOwner } from '../middlewares/ownership';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// Criar gasto em um projeto
router.post('/projects/:id/expenses', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const { descricao, valor, categoria } = req.body as { descricao: string; valor: number; categoria?: string };
  if (!descricao || valor == null) return res.status(400).json({ message: 'Descrição e valor são obrigatórios' });
  const expense = await prisma.expense.create({ data: { projectId, descricao, valor, categoria } });
  res.status(201).json(expense);
});

// Atualizar gasto
router.put('/expenses/:id', requireAuth, ensureExpenseOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { descricao, valor, categoria } = req.body as { descricao?: string; valor?: number; categoria?: string };
  const expense = await prisma.expense.update({ where: { id }, data: { descricao, valor, categoria } });
  res.json(expense);
});

// Deletar gasto
router.delete('/expenses/:id', requireAuth, ensureExpenseOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  await prisma.attachment.deleteMany({ where: { expenseId: id } });
  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

// Configurar uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo não permitido'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload de anexos
router.post('/expenses/:id/attachments', requireAuth, ensureExpenseOwner, upload.single('file'), async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const tipo = (req.body.tipo as AttachmentTipo) || 'nota';
  if (!req.file) return res.status(400).json({ message: 'Arquivo é obrigatório' });
  const url = `/uploads/${req.file.filename}`;
  const attachment = await prisma.attachment.create({ data: { expenseId: id, url, tipo } });
  res.status(201).json(attachment);
});

// Deletar anexo
router.delete('/attachments/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const att = await prisma.attachment.findUnique({ where: { id }, include: { expense: { include: { project: true } } } });
  if (!att || att.expense.project.userId !== req.userId) return res.status(403).json({ message: 'Sem permissão' });
  // remover arquivo físico
  const filePath = path.join(uploadsDir, path.basename(att.url));
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }
  await prisma.attachment.delete({ where: { id } });
  res.status(204).send();
});

export default router;