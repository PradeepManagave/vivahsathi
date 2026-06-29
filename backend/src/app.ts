// ============================================================
// Express Application Setup
// ============================================================

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index';
import logger, { httpLogStream } from './config/logger';
import { errorHandler } from './shared/middleware/error-handler';
import { notFoundHandler } from './shared/middleware/not-found';
import { franchiseBrandingMiddleware, injectFranchiseData } from './shared/middleware/franchise-branding';

import { authRouter } from './modules/auth/auth.routes';
import { profilesRouter } from './modules/profiles/profile.routes';
import { searchRouter } from './modules/search/search.routes';
import { messagingRouter } from './modules/messaging/messaging.routes';
import { membershipRouter } from './modules/membership/membership.routes';
import { geoRouter } from './modules/geo/geo.routes';
import { paymentRouter } from './modules/payments/payment.routes';
import { notificationRouter } from './modules/notifications/notification.routes';
import { deviceRouter } from './modules/notifications/device.routes';
import { videoKycRouter } from './modules/video-kyc/video-kyc.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { franchiseRouter } from './modules/franchise/franchise.routes';
import { superAdminRouter } from './modules/super-admin/super-admin.routes';
import { franchiseCentreRouter } from './modules/franchise-centre/franchise-centre.routes';
import { marketplaceRouter } from './modules/marketplace/marketplace.routes';
import { cmsRouter } from './modules/cms/cms.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { webhookRouter } from './modules/webhook/webhook.routes';
import { documentsRouter } from './modules/documents/documents.routes';

const app: Express = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "https://api.heritagematrimony.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Locale',
    'X-Timezone',
    'X-Timezone-Offset'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
}));

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('combined', {
  stream: httpLogStream,
  skip: (req) => req.url === '/health'
}));

const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  },
  handler: (_req, res, _next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: _req.ip,
      path: _req.path,
      method: _req.method
    });
    res.status(429).json(options.message);
  }
});

app.use(globalLimiter);

app.use(franchiseBrandingMiddleware);
app.use(injectFranchiseData);

const loginLimiter = rateLimit({
  windowMs: config.LOGIN_RATE_LIMIT_WINDOW_MS || 900000,
  max: config.LOGIN_RATE_LIMIT_MAX || 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT',
      message: 'Too many login attempts. Please try again later.'
    }
  }
});

app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/register', loginLimiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/ready', async (_req, res) => {
  res.json({
    status: 'ready',
    checks: {
      database: 'ok',
      redis: 'ok'
    }
  });
});

app.use(`${config.API_PREFIX}/auth`, authRouter);
app.use(`${config.API_PREFIX}/profiles`, profilesRouter);
app.use(`${config.API_PREFIX}/search`, searchRouter);
app.use(`${config.API_PREFIX}/messages`, messagingRouter);
app.use(`${config.API_PREFIX}/membership`, membershipRouter);
app.use(`${config.API_PREFIX}/geo`, geoRouter);
app.use(`${config.API_PREFIX}/payments`, paymentRouter);
app.use(`${config.API_PREFIX}/notifications`, notificationRouter);
app.use(`${config.API_PREFIX}/devices`, deviceRouter);
app.use(`${config.API_PREFIX}/video-kyc`, videoKycRouter);
app.use(`${config.API_PREFIX}/admin`, adminRouter);
app.use(`${config.API_PREFIX}/franchise`, franchiseRouter);
app.use(`${config.API_PREFIX}/super-admin`, superAdminRouter);
app.use(`${config.API_PREFIX}/centre`, franchiseCentreRouter);
app.use(`${config.API_PREFIX}/marketplace`, marketplaceRouter);
app.use(`${config.API_PREFIX}/cms`, cmsRouter);
app.use(`${config.API_PREFIX}/analytics`, analyticsRouter);
app.use(`${config.API_PREFIX}/webhook`, webhookRouter);
app.use(`${config.API_PREFIX}/documents`, documentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
