// scripts/init-platform-settings.js

// Carga variables de entorno desde .env automáticamente
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  console.log('🌱 Inicializando configuración de plataforma...');

  // 1. Crea el pool de conexiones con pg (mejor rendimiento y manejo de conexiones)
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('❌ DATABASE_URL no está definida en .env o en el entorno');
  }

  const pool = new Pool({
    connectionString,
    // Opcional: ajusta según tu app (máx conexiones, timeouts, etc.)
    max: 10,               // máximo de conexiones en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // 2. Crea el adapter de Prisma para PostgreSQL
  const adapter = new PrismaPg(pool);

  // 3. Instancia PrismaClient con el adapter (obligatorio en Prisma 7+)
  const prisma = new PrismaClient({
    adapter,
    // Opcional: logs para debug (quítalo en producción)
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Tu upsert original
    const platformSettings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        platformFeePercent: 7,
        proPlanEnabled: true,
        proPlanPrice: 39.00,
        proPlanFeePercent: 0,
        minPayoutAmount: 50.00,
        freeMaxFileSize: 0.2,
        freeMaxStorage: 10,
        freeMaxProducts: 50,
        proMaxFileSize: 2,
        proMaxStorage: 100,
        proMaxProducts: null,
        paypalEnabled: true,
        paypalMode: 'sandbox',
        paypalClientId: null,
        paypalClientSecret: null,
        platformName: 'CloePark',
        primaryColor: '#000000',
        accentColor: '#6366f1',
        logoUrl: null,
      },
    });

    console.log('✅ Configuración creada exitosamente!');
    console.log(platformSettings);
  } catch (e) {
    console.error('❌ Error durante la inicialización:', e);
    process.exit(1);
  } finally {
    // Desconecta Prisma y cierra el pool
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Error global:', e);
  process.exit(1);
});