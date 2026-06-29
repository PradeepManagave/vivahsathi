// ============================================================
// Database Configuration - Knex + Objection
// ============================================================

import knex, { Knex } from 'knex';
import { Model } from 'objection';
import { config } from './index';
import logger from './logger';

// Database connection configuration
const dbConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: config.DB_POOL_MIN,
    max: config.DB_POOL_MAX,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  migrations: {
    directory: './database/migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
    disableTransactions: false
  },
  seeds: {
    directory: './database/seeds',
    extension: 'ts'
  }
};

// Create database instance
const db = knex(dbConfig);

// Initialize Objection.js
Model.knex(db);

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  return db.transaction(async (trx) => {
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}

// Query builder helpers
export const queries = {
  // Pagination
  paginate: (query: Knex.QueryBuilder, page: number, pageSize: number) => {
    const offset = (page - 1) * pageSize;
    return query.limit(pageSize).offset(offset);
  },
  
  // Soft delete filter
  notDeleted: (query: Knex.QueryBuilder) => {
    return query.whereNull('deleted_at');
  },
  
  // Active filter
  active: (query: Knex.QueryBuilder) => {
    return query.where('status', 'active');
  }
};

// Export database instance and Model
export { db, Model };

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error });
  }
}
