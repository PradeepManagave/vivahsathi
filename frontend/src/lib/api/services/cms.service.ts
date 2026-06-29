import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { CmsPage, SuccessStory, Testimonial, PaginationMeta } from '@/types';

export class CmsService {
  async getPages(params?: { status?: string; language?: string; page?: number; limit?: number }): Promise<{ data: CmsPage[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: CmsPage[]; meta: PaginationMeta }>(API_ENDPOINTS.cms.pages, params);
    return response.data as any;
  }

  async getPageBySlug(slug: string): Promise<CmsPage> {
    const response = await apiClient.get<CmsPage>(API_ENDPOINTS.cms.pageBySlug(slug));
    return response.data as CmsPage;
  }

  async getSuccessStories(params?: { featured?: boolean; status?: string; page?: number; limit?: number }): Promise<{ data: SuccessStory[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: SuccessStory[]; meta: PaginationMeta }>(API_ENDPOINTS.cms.successStories, params);
    return response.data as any;
  }

  async getSuccessStory(id: string): Promise<SuccessStory> {
    const response = await apiClient.get<SuccessStory>(API_ENDPOINTS.cms.successStory(id));
    return response.data as SuccessStory;
  }

  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory> {
    const response = await apiClient.get<SuccessStory>(API_ENDPOINTS.cms.successStoryBySlug(slug));
    return response.data as SuccessStory;
  }

  async getTestimonials(params?: { featured?: boolean; page?: number; limit?: number }): Promise<{ data: Testimonial[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Testimonial[]; meta: PaginationMeta }>(API_ENDPOINTS.cms.testimonials, params);
    return response.data as any;
  }
}

export const cmsService = new CmsService();
