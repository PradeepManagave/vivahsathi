import { Request, Response } from 'express';
import { FranchiseCentreService } from './franchise-centre.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class FranchiseCentreController {
  private service: FranchiseCentreService;

  constructor() {
    this.service = new FranchiseCentreService();
  }

  getDashboard = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const dashboard = await this.service.getCentreDashboard(centreId);
      success(res, dashboard);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get dashboard', 500, 'DASHBOARD_FAILED');
    }
  };

  registerWalkinMember = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const result = await this.service.registerWalkinMember(centreId, staffId, req.body);
      created(res, result, 'Registration submitted for approval');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to register member', 500, 'REGISTER_FAILED');
    }
  };

  getWalkinRegistrations = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await this.service.getWalkinRegistrations(centreId, status, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get registrations', 500, 'GET_FAILED');
    }
  };

  submitMemberChanges = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const { memberId } = req.params;
      const result = await this.service.submitMemberChanges(centreId, staffId, memberId!, req.body);
      success(res, result, 'Changes submitted for approval');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to submit changes', 500, 'SUBMIT_FAILED');
    }
  };

  getAppointments = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const date = req.query.date as string;
      const staffId = req.query.staffId as string;
      const appointments = await this.service.getAppointments(centreId, date, staffId);
      success(res, appointments);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get appointments', 500, 'GET_FAILED');
    }
  };

  getAppointmentSlots = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const { startDate, endDate, staffId } = req.query;
      const slots = await this.service.getAppointmentSlots(
        centreId,
        startDate as string,
        endDate as string,
        staffId as string
      );
      success(res, slots);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get slots', 500, 'GET_FAILED');
    }
  };

  createAppointmentSlot = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const slot = await this.service.createAppointmentSlot(centreId, staffId, req.body);
      created(res, slot, 'Slot created');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create slot', 500, 'CREATE_FAILED');
    }
  };

  bookAppointment = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const { slotId } = req.params;
      const appointment = await this.service.bookAppointment(centreId, staffId, slotId!, req.body);
      created(res, appointment, 'Appointment booked');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to book appointment', 500, 'BOOK_FAILED');
    }
  };

  cancelAppointment = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const { appointmentId } = req.params;
      const { reason } = req.body;
      await this.service.cancelAppointment(centreId, staffId, appointmentId!, reason);
      success(res, null, 'Appointment cancelled');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to cancel appointment', 500, 'CANCEL_FAILED');
    }
  };

  recordOfflinePayment = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staffId = (req as any).user.id;
      const payment = await this.service.recordOfflinePayment(centreId, staffId, req.body);
      success(res, payment, 'Payment recorded');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to record payment', 500, 'PAYMENT_FAILED');
    }
  };

  getStaff = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const staff = await this.service.getStaff(centreId);
      success(res, staff);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get staff', 500, 'GET_FAILED');
    }
  };

  addStaff = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const adminId = (req as any).user.id;
      const staff = await this.service.addStaff(centreId, adminId, req.body);
      created(res, staff, 'Staff added');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add staff', 500, 'ADD_FAILED');
    }
  };

  updateStaff = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const adminId = (req as any).user.id;
      const { staffId } = req.params;
      const staff = await this.service.updateStaff(centreId, adminId, staffId!, req.body);
      success(res, staff, 'Staff updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update staff', 500, 'UPDATE_FAILED');
    }
  };

  removeStaff = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const adminId = (req as any).user.id;
      const { staffId } = req.params;
      await this.service.removeStaff(centreId, adminId, staffId!);
      success(res, null, 'Staff removed');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove staff', 500, 'REMOVE_FAILED');
    }
  };

  getCommissionReport = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const { dateFrom, dateTo } = req.query;
      const report = await this.service.getCommissionReport(centreId, dateFrom as string, dateTo as string);
      success(res, report);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get commission report', 500, 'REPORT_FAILED');
    }
  };

  getCentreMembers = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const filters = {
        status: req.query.status as string,
        planId: req.query.planId as string,
        search: req.query.search as string
      };
      const result = await this.service.getCentreMembers(centreId, filters, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get members', 500, 'GET_FAILED');
    }
  };

  getPendingApprovals = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user.centreId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await this.service.getPendingApprovals(centreId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get approvals', 500, 'GET_FAILED');
    }
  };
}
