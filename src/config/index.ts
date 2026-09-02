import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from backend cwd or parent
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];
for (const c of candidates) {
  if (fs.existsSync(c)) {
    dotenv.config({ path: c });
    break;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'cyclone-super-secret-change-in-production-0123456789',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '..', '..', 'data', 'cyclone.db'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  first20Count: parseInt(process.env.FIRST20_COUNT || '20', 10),
  demoAccounts: parseInt(process.env.DEMO_ACCOUNTS || '6', 10),
};

export const LOYALTY_RULES = {
  journeyCompletion: 100,
  allSteps: 50,
  loungeService: 150,
  premiumService: 100,
  registerItem: 25,
  partnerPurchase: 100,
};
