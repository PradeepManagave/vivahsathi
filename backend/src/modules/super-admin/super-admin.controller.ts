import { Request, Response } from 'express';
import { SuperAdminService } from './super-admin.service';
import { FranchiseAdminService } from './franchise-admin.service';
import { GeoAdminService } from './geo-admin.service';
import { ReportService } from './report.service';
import { CmsService } from './cms.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class SuperAdminController {
  private memberService: SuperAdminService;
  private franchiseService: FranchiseAdminService;
  private geoService: GeoAdminService;
  private reportService: ReportService;
  private cmsService: CmsService;

  constructor() {
    this.memberService = new SuperAdminService();
    this.franchiseService = new FranchiseAdminService();
    this.geoService = new GeoAdminService();
    this.reportService = new ReportService();
    this.cmsService = new CmsService();
  }

  getDashboard = async (req: Request, res: Response) => {
    try {
      const stats = await this.reportService.getDashboardStats();
      success(res, stats);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get dashboard', 500, 'DASHBOARD_FAILED');
    }
  };

  getMembers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const filters = {
        status: req.query.status as string,
        plan: req.query.plan as string,
        franchiseId: req.query.franchiseId as string,
        centreId: req.query.centreId as string,
        gender: req.query.gender as string,
        religion: req.query.religion as string,
        state: req.query.state as string,
        district: req.query.district as string,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const result = await this.memberService.getMembers(filters, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get members', 500, 'GET_FAILED');
    }
  };

  getMemberDetail = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const member = await this.memberService.getMemberDetail(memberId);
      success(res, member);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get member', 500, 'GET_FAILED');
    }
  };

  approveMember = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const adminId = req.user!.id;
      const member = await this.memberService.approveMember(memberId, adminId);
      success(res, member, 'Member approved successfully');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve member', 500, 'APPROVE_FAILED');
    }
  };

  banMember = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const adminId = req.user!.id;
      const { reason, duration } = req.body;
      const member = await this.memberService.banMember(memberId, adminId, reason, duration);
      success(res, member, 'Member banned successfully');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to ban member', 500, 'BAN_FAILED');
    }
  };

  unbanMember = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const adminId = req.user!.id;
      const member = await this.memberService.unbanMember(memberId, adminId);
      success(res, member, 'Member unbanned successfully');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to unban member', 500, 'UNBAN_FAILED');
    }
  };

  convertMembership = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const adminId = req.user!.id;
      const { planId, reason } = req.body;
      const membership = await this.memberService.convertMembership(memberId, adminId, planId, reason);
      success(res, membership, 'Membership converted successfully');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to convert membership', 500, 'CONVERT_FAILED');
    }
  };

  approvePhoto = async (req: Request, res: Response) => {
    try {
      const { memberId, photoId } = req.params;
      const adminId = req.user!.id;
      const { status, rejectionReason } = req.body;
      const photo = await this.memberService.approvePhoto(memberId, photoId, adminId, status, rejectionReason);
      success(res, photo, `Photo ${status}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process photo', 500, 'PHOTO_FAILED');
    }
  };

  getMemberActivityLog = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const logs = await this.memberService.getMemberActivityLog(memberId, page, limit);
      success(res, logs);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get activity log', 500, 'GET_FAILED');
    }
  };

  exportMembers = async (req: Request, res: Response) => {
    try {
      const format = (req.query.format as 'csv' | 'xlsx') || 'csv';
      const filters = {
        status: req.query.status as string,
        gender: req.query.gender as string,
        franchiseId: req.query.franchiseId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const result = await this.memberService.exportMembers(filters, format);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to export members', 500, 'EXPORT_FAILED');
    }
  };

  getAdminActivityLog = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const filters = {
        adminId: req.query.adminId as string,
        action: req.query.action as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const logs = await this.memberService.getAdminActivityLog(filters, page, limit);
      success(res, logs);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get activity log', 500, 'GET_FAILED');
    }
  };

  createFranchise = async (req: Request, res: Response) => {
    try {
      const franchise = await this.franchiseService.create(req.body);
      success(res, franchise, 'Franchise created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create franchise', 500, 'CREATE_FAILED');
    }
  };

  updateFranchise = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = await this.franchiseService.update(franchiseId, req.body);
      success(res, franchise, 'Franchise updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update franchise', 500, 'UPDATE_FAILED');
    }
  };

  getFranchises = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const status = req.query.status as string;
      const result = await this.franchiseService.getFranchiseList(page, limit, status);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get franchises', 500, 'GET_FAILED');
    }
  };

  getFranchiseMembers = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const filters = {
        status: req.query.status as string,
        planId: req.query.planId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const result = await this.franchiseService.getFranchiseMembers(franchiseId, filters, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get franchise members', 500, 'GET_FAILED');
    }
  };

  getFranchiseRevenue = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
      const result = await this.franchiseService.getFranchiseRevenue(franchiseId, dateFrom, dateTo);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get franchise revenue', 500, 'GET_FAILED');
    }
  };

  createCentre = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const centre = await this.franchiseService.createCentre(franchiseId, req.body);
      success(res, centre, 'Centre created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create centre', 500, 'CREATE_FAILED');
    }
  };

  updateCentre = async (req: Request, res: Response) => {
    try {
      const { centreId } = req.params;
      const centre = await this.franchiseService.updateCentre(centreId, req.body);
      success(res, centre, 'Centre updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update centre', 500, 'UPDATE_FAILED');
    }
  };

  addCountry = async (req: Request, res: Response) => {
    try {
      const country = await this.geoService.addCountry(req.body);
      success(res, country, 'Country added', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add country', 500, 'ADD_FAILED');
    }
  };

  addState = async (req: Request, res: Response) => {
    try {
      const state = await this.geoService.addState(req.body);
      success(res, state, 'State added', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add state', 500, 'ADD_FAILED');
    }
  };

  addDistrict = async (req: Request, res: Response) => {
    try {
      const district = await this.geoService.addDistrict(req.body);
      success(res, district, 'District added', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add district', 500, 'ADD_FAILED');
    }
  };

  addTaluka = async (req: Request, res: Response) => {
    try {
      const taluka = await this.geoService.addTaluka(req.body);
      success(res, taluka, 'Taluka added', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add taluka', 500, 'ADD_FAILED');
    }
  };

  addVillage = async (req: Request, res: Response) => {
    try {
      const village = await this.geoService.addVillage(req.body);
      success(res, village, 'Village added', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add village', 500, 'ADD_FAILED');
    }
  };

  updateGeoEntry = async (req: Request, res: Response) => {
    try {
      const { type, id } = req.params;
      const entry = await this.geoService.updateGeoEntry(type, id, req.body);
      success(res, entry, 'Geo entry updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update geo entry', 500, 'UPDATE_FAILED');
    }
  };

  bulkImportVillages = async (req: Request, res: Response) => {
    try {
      const { talukaId, villages } = req.body;
      const result = await this.geoService.bulkImportVillages(talukaId, villages);
      success(res, result, `${result.imported} villages imported`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to bulk import', 500, 'IMPORT_FAILED');
    }
  };

  bulkImportCSV = async (req: Request, res: Response) => {
    try {
      const { talukaId, csvData } = req.body;
      const result = await this.geoService.bulkImportFromCSV(talukaId, csvData);
      success(res, result, `${result.imported} villages imported`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to bulk import', 500, 'IMPORT_FAILED');
    }
  };

  getPendingVillageRequests = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await this.geoService.getPendingVillageRequests(page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get requests', 500, 'GET_FAILED');
    }
  };

  approveVillageRequest = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const adminId = req.user!.id;
      const result = await this.geoService.approveVillageRequest(requestId, adminId);
      success(res, result, 'Village request approved');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve request', 500, 'APPROVE_FAILED');
    }
  };

  rejectVillageRequest = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const adminId = req.user!.id;
      const { reason } = req.body;
      const result = await this.geoService.rejectVillageRequest(requestId, adminId, reason);
      success(res, result, 'Village request rejected');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reject request', 500, 'REJECT_FAILED');
    }
  };

  getMemberReport = async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string,
        planId: req.query.planId as string,
        gender: req.query.gender as string,
        religion: req.query.religion as string,
        city: req.query.city as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const report = await this.reportService.getMemberReport(filters);
      success(res, report);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get report', 500, 'REPORT_FAILED');
    }
  };

  getRevenueReport = async (req: Request, res: Response) => {
    try {
      const filters = {
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        franchiseId: req.query.franchiseId as string
      };
      const report = await this.reportService.getRevenueReport(filters);
      success(res, report);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get report', 500, 'REPORT_FAILED');
    }
  };

  getRenewalReport = async (req: Request, res: Response) => {
    try {
      const report = await this.reportService.getRenewalForecast();
      success(res, report);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get report', 500, 'REPORT_FAILED');
    }
  };

  getCommissionReport = async (req: Request, res: Response) => {
    try {
      const filters = {
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      const report = await this.reportService.getCommissionReport(filters);
      success(res, report);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get report', 500, 'REPORT_FAILED');
    }
  };

  createPage = async (req: Request, res: Response) => {
    try {
      const page = await this.cmsService.createPage(req.body, req.user!.id);
      success(res, page, 'Page created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create page', 500, 'CREATE_FAILED');
    }
  };

  updatePage = async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      const page = await this.cmsService.updatePage(pageId, req.body, req.user!.id);
      success(res, page, 'Page updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update page', 500, 'UPDATE_FAILED');
    }
  };

  getPage = async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      const page = await this.cmsService.getPage(pageId);
      success(res, page);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get page', 500, 'GET_FAILED');
    }
  };

  getPages = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const filters = {
        status: req.query.status as string,
        pageType: req.query.pageType as string
      };
      const result = await this.cmsService.getPages(filters, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get pages', 500, 'GET_FAILED');
    }
  };

  deletePage = async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      await this.cmsService.deletePage(pageId);
      success(res, null, 'Page deleted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete page', 500, 'DELETE_FAILED');
    }
  };

  getSetting = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const setting = await this.cmsService.getSetting(key);
      success(res, setting);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get setting', 500, 'GET_FAILED');
    }
  };

  getSettings = async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const settings = await this.cmsService.getSettings(category);
      success(res, settings);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get settings', 500, 'GET_FAILED');
    }
  };

  updateSetting = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value, category, description } = req.body;
      const setting = await this.cmsService.updateSetting(key, value, category, description, req.user!.id);
      success(res, setting, 'Setting updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update setting', 500, 'UPDATE_FAILED');
    }
  };

  bulkUpdateSettings = async (req: Request, res: Response) => {
    try {
      const { settings } = req.body;
      const result = await this.cmsService.bulkUpdateSettings(settings, req.user!.id);
      success(res, result, 'Settings updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update settings', 500, 'UPDATE_FAILED');
    }
  };

  createBanner = async (req: Request, res: Response) => {
    try {
      const banner = await this.cmsService.createBanner(req.body, req.user!.id);
      success(res, banner, 'Banner created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create banner', 500, 'CREATE_FAILED');
    }
  };

  updateBanner = async (req: Request, res: Response) => {
    try {
      const { bannerId } = req.params;
      const banner = await this.cmsService.updateBanner(bannerId, req.body);
      success(res, banner, 'Banner updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update banner', 500, 'UPDATE_FAILED');
    }
  };

  getBanners = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const filters = {
        position: req.query.position as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
      };
      const result = await this.cmsService.getBanners(filters, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get banners', 500, 'GET_FAILED');
    }
  };

  deleteBanner = async (req: Request, res: Response) => {
    try {
      const { bannerId } = req.params;
      await this.cmsService.deleteBanner(bannerId);
      success(res, null, 'Banner deleted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete banner', 500, 'DELETE_FAILED');
    }
  };
}
