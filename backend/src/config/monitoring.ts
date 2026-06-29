// ============================================================
// Monitoring Configuration
// ============================================================

import { config } from '../config/index';
import winston from 'winston';

export function createElasticsearchTransport() {
  if (!config.ELASTICSEARCH_NODE || !config.LOG_FILE_ENABLED) return null;

  try {
    const { ElasticsearchTransport } = require('winston-elasticsearch');
    return new ElasticsearchTransport({
      level: config.LOG_LEVEL || 'info',
      clientOpts: {
        node: config.ELASTICSEARCH_NODE,
        auth: config.ELASTICSEARCH_API_KEY
          ? { apiKey: config.ELASTICSEARCH_API_KEY }
          : undefined,
        maxRetries: 3,
        requestTimeout: 10000,
      },
      index: `vivahsathi-logs-${new Date().toISOString().slice(0, 7)}`,
      handleExceptions: true,
      handleRejections: true,
    });
  } catch {
    console.warn('Elasticsearch transport not available');
    return null;
  }
}

export function createLoggingTransports(): winston.transport[] {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
  ];

  if (config.LOG_FILE_ENABLED) {
    transports.push(
      new winston.transports.File({
        filename: `${config.LOG_FILE_PATH || './logs'}/error.log`,
        level: 'error',
        maxsize: config.LOG_FILE_MAX_SIZE || 104857600,
        maxFiles: config.LOG_FILE_MAX_FILES || 14,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: `${config.LOG_FILE_PATH || './logs'}/combined.log`,
        maxsize: config.LOG_FILE_MAX_SIZE || 104857600,
        maxFiles: config.LOG_FILE_MAX_FILES || 14,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    );
  }

  const esTransport = createElasticsearchTransport();
  if (esTransport) transports.push(esTransport);

  return transports;
}

export function createHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
}
