# Construapp

Aplicação de gestão de obras focada em controle de gastos, anexos e relatórios. Monorepo com `frontend` (React + Vite + TS) e `backend` (Node + Express + TS + Prisma).

## Stack
- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, Recharts, axios
- Backend: Node.js, Express, TypeScript, Prisma ORM, jsonwebtoken (JWT), bcryptjs, multer, PDFKit, cors, dotenv
- Banco de dados: Prisma com `DATABASE_URL` (SQLite/PostgreSQL, conforme ambiente)
- Dev: npm workspaces, nodemon, ts-node, HMR (Vite)

## Requisitos
- Node.js 18+ (ou 20+)
- npm 9+

## Setup
1. Instalação de dependências na raiz:
   - `npm install`
2. Configurar `.env` no backend (`backend/.env`):
   - `DATABASE_URL=...
   - `JWT_SECRET=uma_chave_segura`
   - `PORT=4000`
3. Prisma (dev):
   - `npm run migrate -w backend` (aplica migrações)
   - Opcional: `npm run seed -w backend` (popular dados demo se disponível)

## Desenvolvimento
- Rodar frontend e backend juntos:
  - `npm run dev`
- Endpoints locais:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:4000`

## Scripts úteis
- Raiz:
  - `npm run dev` — inicia backend e frontend
  - `npm run install:all` — instala dependências em ambos workspaces
- Frontend:
  - `npm run dev` — Vite dev server
  - `npm run build` — build de produção
  - `npm run preview` — servidor de preview
- Backend:
  - `npm run dev` — servidor Express com nodemon
  - `npm run migrate` — `prisma migrate dev`
  - `npm run prisma` — CLI do Prisma
  - `npm run seed` — popula dados de exemplo (se implementado)

## Rotas da API (resumo)
- Auth:
  - `POST /auth/signup` — cria usuário
  - `POST /auth/login` — autentica, retorna JWT
- Projects:
  - `GET /projects` | `POST /projects`
  - `GET /projects/:id` | `PUT /projects/:id` | `DELETE /projects/:id`
- Expenses:
  - `GET /projects/:id/expenses` | `POST /projects/:id/expenses`
  - `DELETE /projects/:id/expenses/:expenseId`
- Reports:
  - `GET /projects/:id/report` — agregações por categoria
  - `GET /projects/:id/report.csv` | `GET /projects/:id/report.pdf`
- Attachments:
  - `POST /projects/:id/expenses/:expenseId/attachments` — upload (jpeg/png/pdf até 5MB)

## Autenticação
- JWT no header `Authorization: Bearer <token>`
- Rotas privadas exigem token válido

## CI (GitHub Actions)
Pipeline de build/type-check em pushes e PRs (`.github/workflows/ci.yml`):
- Node.js 18 e 20
- Instala dependências do monorepo
- Build do frontend (`vite build`)
- Type-check do backend (`tsc --noEmit`)

## Deploy (sugestão)
- Frontend: Vercel/Netlify (build `npm run build` na pasta `frontend`)
- Backend: Render/Railway/Fly.io; configure `DATABASE_URL`, `JWT_SECRET` e porta (`4000`)
- Banco: PostgreSQL gerenciado (Supabase/Neon/Railway)

## Observações
- Ajuste `DATABASE_URL` conforme seu banco (SQLite para dev, Postgres para prod)
- Caso use portas diferentes ou CORS, configure em `backend/src/server.ts`