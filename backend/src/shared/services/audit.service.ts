import { db } from '../../config/database';
import logger from '../../config/logger';

export type AuditCategory = 'admin' | 'centre' | 'kyc' | 'auth' | 'profile' | 'payment';

interface AuditLogEntry {
  category: AuditCategory;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  targetId?: string | null;
  targetType?: string | null;
}

class AuditService {
  async log(entry: AuditLogEntry): Promise<void> {
    const { category, userId, action, details, ipAddress, userAgent, targetId, targetType } = entry;

    const logData = {
      user_id: userId,
      action,
      details: JSON.stringify(details),
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      target_id: targetId || null,
      target_type: targetType || null,
      created_at: new Date()
    };

    const tableMap: Record<AuditCategory, string> = {
      admin: 'admin_audit_logs',
      centre: 'centre_activity_logs',
      kyc: 'kyc_verification_logs',
      auth: 'auth_audit_logs',
      profile: 'profile_audit_logs',
      payment: 'payment_audit_logs'
    };

    const table = tableMap[category];

    try {
      await db(table).insert(logData);
    } catch (error) {
      logger.error(`Failed to write ${category} audit log`, { error, userId, action, table });
    }
  }

  async logAdmin(userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ category: 'admin', userId, action, details, ...context });
  }

  async logCentre(centreId: string, userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ 
      category: 'centre', 
      userId, 
      action, 
      details: { centre_id: centreId, ...details },
      targetId: centreId,
      targetType: 'centre',
      ...context 
    });
  }

  async logKyc(userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ category: 'kyc', userId, action, details, ...context });
  }

  async logAuth(userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ category: 'auth', userId, action, details, ...context });
  }

  async logProfile(userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ category: 'profile', userId, action, details, ...context });
  }

  async logPayment(userId: string, action: string, details: Record<string, unknown>, context?: Partial<AuditLogEntry>): Promise<void> {
    await this.log({ category: 'payment', userId, action, details, ...context });
  }
}

export const auditService = new AuditService();
