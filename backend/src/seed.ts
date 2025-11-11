import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@construapp.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@construapp.com',
      password_hash,
    },
  });

  await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Obra Exemplo',
      userId: user.id,
      status: 'ativo',
    },
  });

  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });