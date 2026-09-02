import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { migrate } from './db/schema';
import { logger } from './utils/logger';
import { notFoundHandler, errorHandler } from './middleware/errors';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import journeyRoutes from './modules/journey/journey.routes';
import airportRoutes from './modules/airports/airport.routes';
import flightRoutes from './modules/flights/flight.routes';
import itemRoutes from './modules/items/item.routes';
import itemQrRoutes from './modules/items/item-qr.routes';
import loyaltyRoutes from './modules/loyalty/loyalty.routes';
import rewardRoutes from './modules/rewards/reward.routes';
import serviceRoutes from './modules/services/airport-service.routes';
import premiumRoutes from './modules/premium/premium.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import healthRoutes from './modules/health/health.routes';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  // Dev-friendly CORS: reflect the request origin (Flutter web dev server uses a random port).
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: { code: 'rate_limited', message: 'Too many requests, please try again later.' } },
    })
  );

  app.use('/health', healthRoutes);

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/journey', journeyRoutes);
  app.use('/api/airports', airportRoutes);
  app.use('/api/flights', flightRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/qr', itemQrRoutes);
  app.use('/api/loyalty', loyaltyRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/premium', premiumRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function startServer() {
  migrate();
  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`CYCLONE backend listening on http://localhost:${config.port}`);
  });
  return { app, server };
}

if (require.main === module) {
  startServer();
}