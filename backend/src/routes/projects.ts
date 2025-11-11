import { Router, Request, Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { ensureProjectOwner } from '../middlewares/ownership';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();
const router = Router();

// Listar projetos do usuário
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const projects = await prisma.project.findMany({ where: { userId: req.userId }, orderBy: { id: 'desc' } });
  res.json(projects);
});

// Criar projeto
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
  const project = await prisma.project.create({ data: { name, address, userId: req.userId! } });
  res.status(201).json(project);
});

// Atualizar projeto
router.put('/:id', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const { name, address, status } = req.body as { name?: string; address?: string; status?: ProjectStatus };
  const id = Number(req.params.id);
  const updated = await prisma.project.update({ where: { id }, data: { name, address, status } });
  res.json(updated);
});

// Deletar projeto (remover gastos e anexos)
router.delete('/:id', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  // apagar anexos -> gastos -> projeto
  const expenses = await prisma.expense.findMany({ where: { projectId: id }, select: { id: true } });
  const expenseIds = expenses.map(e => e.id);
  await prisma.attachment.deleteMany({ where: { expenseId: { in: expenseIds } } });
  await prisma.expense.deleteMany({ where: { id: { in: expenseIds } } });
  await prisma.project.delete({ where: { id } });
  res.status(204).send();
});

// Listar gastos de um projeto
router.get('/:id/expenses', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const expenses = await prisma.expense.findMany({ where: { projectId: id }, orderBy: { id: 'desc' }, include: { attachments: true } });
  res.json(expenses);
});

// Relatório: totais por categoria e total geral
router.get('/:id/report', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const grouped = await prisma.expense.groupBy({
    by: ['categoria'],
    where: { projectId: id },
    _sum: { valor: true },
  });
  const porCategoria: Record<string, number> = {};
  let totalGeral = 0;
  grouped.forEach(g => {
    const cat = g.categoria ?? 'Sem categoria';
    const sum = Number(g._sum.valor || 0);
    porCategoria[cat] = sum;
    totalGeral += sum;
  });
  res.json({ porCategoria, totalGeral });
});

// Exportar CSV
router.get('/:id/report/csv', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const grouped = await prisma.expense.groupBy({ by: ['categoria'], where: { projectId: id }, _sum: { valor: true } });
  let totalGeral = 0;
  const lines = ['categoria,total'];
  grouped.forEach(g => {
    const cat = g.categoria ?? 'Sem categoria';
    const sum = Number(g._sum.valor || 0);
    totalGeral += sum;
    lines.push(`${cat},${sum.toFixed(2)}`);
  });
  lines.push(`TOTAL,${totalGeral.toFixed(2)}`);
  const csv = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
  res.send(csv);
});

// Exportar PDF
router.get('/:id/report/pdf', requireAuth, ensureProjectOwner, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const grouped = await prisma.expense.groupBy({ by: ['categoria'], where: { projectId: id }, _sum: { valor: true } });
  let totalGeral = 0;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
  doc.pipe(res);
  doc.fontSize(18).text('Relatório por Categoria', { align: 'center' });
  doc.moveDown();
  grouped.forEach(g => {
    const cat = g.categoria ?? 'Sem categoria';
    const sum = Number(g._sum.valor || 0);
    totalGeral += sum;
    doc.fontSize(12).text(`${cat}: R$ ${sum.toFixed(2)}`);
  });
  doc.moveDown();
  doc.fontSize(14).text(`Total Geral: R$ ${totalGeral.toFixed(2)}`);
  doc.end();
});

export default router;