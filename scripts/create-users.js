require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/alshowla?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedPassword },
    create: { email: 'admin@example.com', name: 'Admin User', role: 'admin', password: hashedPassword }
  });

  await prisma.user.upsert({
    where: { email: 'contractor@example.com' },
    update: { password: hashedPassword },
    create: { email: 'contractor@example.com', name: 'Contractor User', role: 'contractor', password: hashedPassword }
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { password: hashedPassword },
    create: { email: 'user@example.com', name: 'Normal User', role: 'user', password: hashedPassword }
  });

  console.log('Users created successfully with password checking!');
  console.log('You can login with:');
  console.log('Admin: admin@example.com');
  console.log('Contractor: contractor@example.com');
  console.log('User: user@example.com');
  console.log('Password for all is: password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
