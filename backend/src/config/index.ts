// ============================================================
// Application Configuration
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Environment Schema Validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('M-Plus API'),
  APP_URL: z.string().url().default('http://localhost:4000'),
  APP_PORT: z.coerce.number().default(4000),
  APP_DEBUG: z.string().default('true').transform(v => v === 'true'),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
  APP_SECRET_KEY: z.string().min(64),
  
  // Server
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  API_PREFIX: z.string().default('/api/v1'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_SSL: z.string().default('false').transform(v => v === 'true'),
  DB_LOGGING: z.string().default('true').transform(v => v === 'true'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_KEY_PREFIX: z.string().default('mplus:'),
  
  // JWT
  JWT_SECRET: z.string().min(64),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_ALGORITHM: z.string().default('HS256'),
  REFRESH_TOKEN_SECRET: z.string().min(64),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(5),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().default('M-Plus Matrimony'),
  SMTP_FROM_EMAIL: z.string().email().default('noreply@mplus.example.com'),
  
  // Payment
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  GST_RATE: z.coerce.number().default(0.18),
  
  // Company Info (for invoices)
  COMPANY_NAME: z.string().default('M-Plus Matrimony'),
  COMPANY_ADDRESS: z.string().default('Mumbai, Maharashtra, India'),
  COMPANY_PHONE: z.string().default('+91 98765 43210'),
  COMPANY_EMAIL: z.string().default('support@mplus.example.com'),
  COMPANY_GSTIN: z.string().optional(),
  COMPANY_PAN: z.string().optional(),
  
  // Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET: z.string().default('mplus-uploads'),
  AWS_S3_BUCKET_URL: z.string().optional(),
  AWS_CLOUDFRONT_URL: z.string().optional(),
  
  // Elasticsearch
  ELASTICSEARCH_ENABLED: z.string().default('false').transform(v => v === 'true'),
  ELASTICSEARCH_NODE: z.string().optional(),
  ELASTICSEARCH_API_KEY: z.string().optional(),
  ELASTICSEARCH_INDEX_PREFIX: z.string().default('mplus_'),
  
  // Social Login
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  // CAPTCHA
  RECAPTCHA_SITE_KEY: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  RECAPTCHA_SCORE_THRESHOLD: z.coerce.number().default(0.5),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
  LOG_FILE_ENABLED: z.string().default('true').transform(v => v === 'true'),
  LOG_CONSOLE_ENABLED: z.string().default('true').transform(v => v === 'true'),
  LOG_FILE_PATH: z.string().default('./logs'),
  LOG_FILE_MAX_SIZE: z.coerce.number().default(104857600), // 100MB
  LOG_FILE_MAX_FILES: z.coerce.number().default(14),
  
  // Feature Flags
  FEATURE_VIDEO_KYC: z.string().default('true').transform(v => v === 'true'),
  FEATURE_VIDEO_CHAT: z.string().default('true').transform(v => v === 'true'),
  FEATURE_WHATSAPP: z.string().default('true').transform(v => v === 'true'),
  FEATURE_MARKETPLACE: z.string().default('true').transform(v => v === 'true'),
  
  // Video Services
  DAILY_API_KEY: z.string().optional(),
  DAILY_API_URL: z.string().optional().default('https://api.daily.co/v1'),
  
  // Maintenance
  MAINTENANCE_MODE: z.string().default('false').transform(v => v === 'true'),
  MAINTENANCE_MESSAGE: z.string().default('System under maintenance')
});

// Validate and parse environment
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;

// Type export
export type Config = typeof config;

// Derived values
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
