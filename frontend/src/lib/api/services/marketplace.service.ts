import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { MarketplaceVendor, MarketplaceClassified, MarketplaceCategory, PaginationMeta } from '@/types';

export class MarketplaceService {
  async listVendors(params?: { page?: number; limit?: number; categoryId?: string; search?: string; location?: string; sort?: string }): Promise<{ data: MarketplaceVendor[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: MarketplaceVendor[]; meta: PaginationMeta }>(API_ENDPOINTS.marketplace.vendors, params);
    return response.data as any;
  }

  async getVendor(id: string): Promise<MarketplaceVendor> {
    const response = await apiClient.get<MarketplaceVendor>(API_ENDPOINTS.marketplace.vendor(id));
    return response.data as MarketplaceVendor;
  }

  async createVendor(data: Partial<MarketplaceVendor>): Promise<MarketplaceVendor> {
    const response = await apiClient.post<MarketplaceVendor>(API_ENDPOINTS.marketplace.vendors, data);
    return response.data as MarketplaceVendor;
  }

  async updateVendor(id: string, data: Partial<MarketplaceVendor>): Promise<MarketplaceVendor> {
    const response = await apiClient.put<MarketplaceVendor>(API_ENDPOINTS.marketplace.vendor(id), data);
    return response.data as MarketplaceVendor;
  }

  async deleteVendor(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.marketplace.vendor(id));
  }

  async submitVendorInquiry(vendorId: string, data: { name: string; email: string; phone?: string; message: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.marketplace.vendorInquire(vendorId), data);
  }

  async listClassifieds(params?: { page?: number; limit?: number; categoryId?: string; search?: string; location?: string; sort?: string; userId?: string }): Promise<{ data: MarketplaceClassified[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: MarketplaceClassified[]; meta: PaginationMeta }>(API_ENDPOINTS.marketplace.classifieds, params);
    return response.data as any;
  }

  async getClassified(id: string): Promise<MarketplaceClassified> {
    const response = await apiClient.get<MarketplaceClassified>(API_ENDPOINTS.marketplace.classified(id));
    return response.data as MarketplaceClassified;
  }

  async createClassified(data: Partial<MarketplaceClassified>): Promise<MarketplaceClassified> {
    const response = await apiClient.post<MarketplaceClassified>(API_ENDPOINTS.marketplace.classifieds, data);
    return response.data as MarketplaceClassified;
  }

  async updateClassified(id: string, data: Partial<MarketplaceClassified>): Promise<MarketplaceClassified> {
    const response = await apiClient.put<MarketplaceClassified>(API_ENDPOINTS.marketplace.classified(id), data);
    return response.data as MarketplaceClassified;
  }

  async deleteClassified(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.marketplace.classified(id));
  }

  async toggleClassifiedFavorite(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.marketplace.classifiedFavorite(id));
  }

  async listCategories(type?: 'vendor' | 'classified'): Promise<MarketplaceCategory[]> {
    const response = await apiClient.get<MarketplaceCategory[]>(API_ENDPOINTS.marketplace.categories, { type });
    return response.data as MarketplaceCategory[];
  }

  async getCategory(id: string): Promise<MarketplaceCategory> {
    const response = await apiClient.get<MarketplaceCategory>(API_ENDPOINTS.marketplace.categories + '/' + id);
    return response.data as MarketplaceCategory;
  }

  async getVendorsByCategory(categoryId: string, params?: { page?: number; limit?: number }): Promise<{ data: MarketplaceVendor[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: MarketplaceVendor[]; meta: PaginationMeta }>(API_ENDPOINTS.marketplace.categoryVendors(categoryId), params);
    return response.data as any;
  }

  async getClassifiedsByCategory(categoryId: string, params?: { page?: number; limit?: number }): Promise<{ data: MarketplaceClassified[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: MarketplaceClassified[]; meta: PaginationMeta }>(API_ENDPOINTS.marketplace.categoryClassifieds(categoryId), params);
    return response.data as any;
  }
}

export const marketplaceService = new MarketplaceService();
