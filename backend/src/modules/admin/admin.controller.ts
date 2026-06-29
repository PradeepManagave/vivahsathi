import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { success } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class AdminController {
  private service: AdminService;

  constructor() {
    this.service = new AdminService();
  }

  getDashboard = async (_req: Request, res: Response) => {
    try {
      const stats = await this.service.getDashboardStats();
      success(res, stats);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get dashboard stats', 500, 'GET_FAILED');
    }
  };

  getMembers = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const filters = {
        status: req.query.status as string,
        gender: req.query.gender as string,
        membershipPlan: req.query.membershipPlan as string,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };

      const result = await this.service.getMembers(filters, page, limit, adminId);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get members', 500, 'GET_FAILED');
    }
  };

  getMemberDetail = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { memberId } = req.params;

      const member = await this.service.getMemberDetail(memberId!, adminId);
      success(res, member);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get member details', 500, 'GET_FAILED');
    }
  };

  updateMemberStatus = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { memberId } = req.params;
      const { status, reason } = req.body;

      const member = await this.service.updateMemberStatus(memberId!, adminId, status, reason);
      success(res, member, 'Member status updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update member status', 500, 'UPDATE_FAILED');
    }
  };

  bulkUpdateStatus = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { memberIds, status, reason } = req.body;

      const result = await this.service.bulkUpdateMemberStatus(memberIds, adminId, status, reason);
      success(res, result, `${result.updated} members updated`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update members', 500, 'UPDATE_FAILED');
    }
  };

  getReports = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const status = req.query.status as string;

      const result = await this.service.getReports(status, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get reports', 500, 'GET_FAILED');
    }
  };

  updateReportStatus = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { reportId } = req.params;
      const { status, actionTaken } = req.body;

      const report = await this.service.updateReportStatus(reportId!, adminId, status, actionTaken);
      success(res, report, 'Report updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update report', 500, 'UPDATE_FAILED');
    }
  };

  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const filters = {
        action: req.query.action as string,
        userId: req.query.userId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };

      const result = await this.service.getAuditLogs(page, limit, filters);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get audit logs', 500, 'GET_FAILED');
    }
  };

  getAnalytics = async (req: Request, res: Response) => {
    try {
      const timeRange = (req.query.timeRange as 'day' | 'week' | 'month' | 'year') || 'month';

      const analytics = await this.service.getAnalytics(timeRange);
      success(res, analytics);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get analytics', 500, 'GET_FAILED');
    }
  };

  getMembershipAnalytics = async (_req: Request, res: Response) => {
    try {
      const analytics = await this.service.getMembershipAnalytics();
      success(res, analytics);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get membership analytics', 500, 'GET_FAILED');
    }
  };

  getSettings = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const search = req.query.search as string;

      const result = await this.service.getSettings({ search, page, limit });
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get settings', 500, 'GET_FAILED');
    }
  };

  getSetting = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const setting = await this.service.getSetting(key!);
      success(res, setting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get setting', 500, 'GET_FAILED');
    }
  };

  updateSetting = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { key } = req.params;
      const { value, type } = req.body;

      const setting = await this.service.updateSetting(key!, value, adminId, type);
      success(res, setting, 'Setting updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update setting', 500, 'UPDATE_FAILED');
    }
  };

  deleteSetting = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { key } = req.params;

      const result = await this.service.deleteSetting(key!, adminId);
      success(res, result, 'Setting deleted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete setting', 500, 'DELETE_FAILED');
    }
  };

  exportMembers = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const format = (req.query.format as 'csv' | 'xlsx') || 'csv';

      const filters = {
        status: req.query.status as string,
        gender: req.query.gender as string,
        search: req.query.search as string
      };

      const result = await this.service.exportMembers(filters, adminId, format);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to export members', 500, 'EXPORT_FAILED');
    }
  };
}
