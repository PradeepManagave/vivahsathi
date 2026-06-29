// ============================================================
// API Client - M-Plus Matrimony Platform
// ============================================================

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { API_URL, API_TIMEOUT, API_RETRY_COUNT } from './config';
import {
  ApiResponse,
  ApiError,
  FieldError,
  PaginationMeta,
  PaginationParams
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  public createAbortController(requestId: string): AbortController {
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    return controller;
  }

  public abortRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  public abortAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language header
        const locale = this.getLocale();
        if (locale && config.headers) {
          config.headers['X-Locale'] = locale;
        }

        // Add request ID for tracing
        const requestId = this.generateRequestId();
        if (config.headers) {
          config.headers['X-Request-ID'] = requestId;
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        // Handle 401 - Token refresh
        if (error.response?.status === 401 && !originalRequest._retryCount) {
          originalRequest._retryCount = 0;

          try {
            await this.refreshToken();
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
          await this.delay(delay);
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          return this.client(originalRequest);
        }

        // Retry on network errors
        if (this.isNetworkError(error) && (originalRequest._retryCount || 0) < API_RETRY_COUNT) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          await this.delay(this.getRetryDelay(originalRequest._retryCount));
          return this.client(originalRequest);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }

      if (axiosError.code === 'ECONNABORTED' || axiosError.name === 'CanceledError') {
        return {
          code: 'REQUEST_CANCELLED',
          message: 'Request was cancelled.'
        };
      }

      if (axiosError.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out. Please try again.'
        };
      }

      if (this.isNetworkError(axiosError)) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.'
        };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.'
    };
  }

  private isNetworkError(error: AxiosError): boolean {
    return !error.response && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND');
  }

  private getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getLocale(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('locale') || 'en';
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  // Token Management
  public setAuthToken(token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  public async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post<{ data: { token: string } }>('/auth/refresh-token', {
      refreshToken
    });

    this.setAuthToken(response.data.data.token, refreshToken);
  }

  // HTTP Methods with optional cancellation support
  public async get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, {
      params,
      ...config
    });
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Upload Files
  public async upload<T>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof File ? new FormData() : file;
    
    if (file instanceof File) {
      formData.append('file', file);
    }

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });

    return response.data;
  }

  // Download File
  public async download(
    url: string,
    filename?: string
  ): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    verifyPhone: '/auth/verify-phone',
    sendOtp: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp',
    google: '/auth/google',
    facebook: '/auth/facebook'
  },

  // Users
  users: {
    me: '/users/me',
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    deleteAccount: '/users/account'
  },

  // Profiles
  profiles: {
    list: '/profiles',
    search: '/profiles/search',
    bySlug: (slug: string) => `/profiles/slug/${slug}`,
    byId: (id: string) => `/profiles/${id}`,
    photos: (profileId: string) => `/profiles/${profileId}/photos`,
    family: (profileId: string) => `/profiles/${profileId}/family`,
    horoscope: (profileId: string) => `/profiles/${profileId}/horoscope`,
    preferences: (profileId: string) => `/profiles/${profileId}/preferences`,
    uploadPhoto: (profileId: string) => `/profiles/${profileId}/photos`,
    deletePhoto: (profileId: string, photoId: string) => `/profiles/${profileId}/photos/${photoId}`
  },

  // Matches
  matches: {
    list: '/matches',
    daily: '/matches/daily',
    recommendations: '/matches/recommendations',
    compatibility: (profileId: string) => `/matches/compatibility/${profileId}`
  },

  // Interests
  interests: {
    sent: '/interests/sent',
    received: '/interests/received',
    send: '/interests',
    accept: (id: string) => `/interests/${id}/accept`,
    reject: (id: string) => `/interests/${id}/reject`,
    cancel: (id: string) => `/interests/${id}/cancel`
  },

  // Messages
  messages: {
    conversations: '/messages/conversations',
    byConversation: (conversationId: string) => `/messages/conversation/${conversationId}`,
    send: '/messages',
    markRead: (messageId: string) => `/messages/${messageId}/read`
  },

  // Membership
  membership: {
    plans: '/membership/plans',
    current: '/membership/current',
    upgrade: '/membership/upgrade',
    cancel: '/membership/cancel',
    prepaid: '/membership/prepaid',
    checkout: '/membership/checkout'
  },

  // Video KYC
  videoKyc: {
    sessions: '/video-kyc/sessions',
    createSession: '/video-kyc/sessions',
    slots: '/video-kyc/slots',
    bookSlot: '/video-kyc/slots/book',
    createSlot: '/video-kyc/slots',
    status: '/video-kyc/status',
    joinSession: (sessionId: string) => `/video-kyc/sessions/${sessionId}/join`,
    completeSession: (sessionId: string) => `/video-kyc/sessions/${sessionId}/complete`,
    cancelSession: (sessionId: string) => `/video-kyc/sessions/${sessionId}/cancel`,
    documents: '/video-kyc/documents',
    admin: {
      pendingVerifications: '/video-kyc/admin/pending-verifications',
      pendingSessions: '/video-kyc/admin/pending-sessions',
      approveSession: (sessionId: string) => `/video-kyc/admin/sessions/${sessionId}/approve`,
      rejectSession: (sessionId: string) => `/video-kyc/admin/sessions/${sessionId}/reject`,
      verifyDocument: (documentId: string) => `/video-kyc/admin/documents/${documentId}/verify`,
      evaluateSession: (sessionId: string) => `/video-kyc/admin/sessions/${sessionId}/evaluate`
    }
  },

  // Video Chat
  videoChat: {
    initiate: (profileId: string) => `/chat/video/initiate/${profileId}`,
    accept: (callId: string) => `/chat/video/accept/${callId}`,
    decline: (callId: string) => `/chat/video/decline/${callId}`,
    join: (callId: string) => `/chat/video/join/${callId}`,
    end: (callId: string) => `/chat/video/end/${callId}`,
    consent: (callId: string) => `/chat/video/consent/${callId}`,
    history: '/chat/video/history',
    incoming: '/chat/video/incoming',
    details: (callId: string) => `/chat/video/${callId}`
  },

  // Geo Data
  geo: {
    countries: '/geo/countries',
    states: (countryId: string) => `/geo/countries/${countryId}/states`,
    districts: (stateId: string) => `/geo/states/${stateId}/districts`,
    talukas: (districtId: string) => `/geo/districts/${districtId}/talukas`,
    villages: (talukaId: string) => `/geo/talukas/${talukaId}/villages`,
    search: '/geo/search'
  },

  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings'
  },

  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    members: '/admin/members',
    member: (id: string) => `/admin/members/${id}`,
    approveMember: (id: string) => `/admin/members/${id}/approve`,
    banMember: (id: string) => `/admin/members/${id}/ban`,
    unbanMember: (id: string) => `/admin/members/${id}/unban`,
    convertMembership: (id: string) => `/admin/members/${id}/convert`,
    memberActivityLog: (id: string) => `/admin/members/${id}/activity-log`,
    franchiseCentres: '/admin/franchises',
    franchiseCentre: (id: string) => `/admin/franchises/${id}`,
    reports: '/admin/reports',
    cms: '/admin/cms',
    settings: '/admin/settings',
    membershipPlans: '/admin/membership-plans',
    geoData: '/admin/geo-data'
  },

  // Super Admin
  superAdmin: {
    dashboard: '/super-admin/dashboard',
    members: '/super-admin/members',
    member: (id: string) => `/super-admin/members/${id}`,
    memberExport: '/super-admin/members/export',
    approveMember: (id: string) => `/super-admin/members/${id}/approve`,
    verifyMember: (id: string) => `/super-admin/members/${id}/verify`,
    banMember: (id: string) => `/super-admin/members/${id}/ban`,
    unbanMember: (id: string) => `/super-admin/members/${id}/unban`,
    convertMembership: (id: string) => `/super-admin/members/${id}/convert`,
    approvePhoto: (memberId: string, photoId: string) => `/super-admin/members/${memberId}/photos/${photoId}`,
    memberActivityLog: (id: string) => `/super-admin/members/${id}/activity-log`,
    activityLog: '/super-admin/activity-log',
    franchises: '/super-admin/franchises',
    franchise: (id: string) => `/super-admin/franchises/${id}`,
    franchiseMembers: (id: string) => `/super-admin/franchises/${id}/members`,
    franchiseRevenue: (id: string) => `/super-admin/franchises/${id}/revenue`,
    createCentre: (id: string) => `/super-admin/franchises/${id}/centres`,
    updateCentre: (id: string) => `/super-admin/centres/${id}`,
    geo: {
      countries: '/super-admin/geo/countries',
      states: '/super-admin/geo/states',
      districts: '/super-admin/geo/districts',
      talukas: '/super-admin/geo/talukas',
      villages: '/super-admin/geo/villages',
      bulkImport: '/super-admin/geo/bulk-import',
      bulkImportCsv: '/super-admin/geo/bulk-import-csv',
      villageRequests: '/super-admin/geo/village-requests',
      approveVillageRequest: (id: string) => `/super-admin/geo/village-requests/${id}/approve`,
      rejectVillageRequest: (id: string) => `/super-admin/geo/village-requests/${id}/reject`
    },
    reports: {
      members: '/super-admin/reports/members',
      revenue: '/super-admin/reports/revenue',
      renewals: '/super-admin/reports/renewals',
      commissions: '/super-admin/reports/commissions'
    },
    cms: {
      pages: '/super-admin/cms/pages',
      page: (id: string) => `/super-admin/cms/pages/${id}`,
      banners: '/super-admin/cms/banners',
      banner: (id: string) => `/super-admin/cms/banners/${id}`,
      settings: '/super-admin/cms/settings',
      setting: (key: string) => `/super-admin/cms/settings/${key}`
    }
  },

  // Franchise
  franchise: {
    dashboard: '/franchise/dashboard',
    members: '/franchise/members',
    member: (id: string) => `/franchise/members/${id}`,
    staff: '/franchise/staff',
    appointments: '/franchise/appointments',
    appointment: (id: string) => `/franchise/appointments/${id}`,
    vendors: '/franchise/vendors',
    reports: '/franchise/reports'
  },

  // CMS (public)
  cms: {
    pages: '/cms/pages',
    pageBySlug: (slug: string) => `/cms/pages/slug/${slug}`,
    testimonials: '/cms/testimonials',
    successStories: '/cms/success-stories',
    successStoryBySlug: (slug: string) => `/cms/success-stories/slug/${slug}`,
    successStory: (id: string) => `/cms/success-stories/${id}`,
  },

  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    revenue: '/analytics/revenue',
    activity: '/analytics/activity',
  },

  // Webhook
  webhook: {
    events: '/webhook/events',
  },

  // Marketplace
  marketplace: {
    categories: '/marketplace/categories',
    categoryVendors: (id: string) => `/marketplace/categories/${id}/vendors`,
    categoryClassifieds: (id: string) => `/marketplace/categories/${id}/classifieds`,
    vendors: '/marketplace/vendors',
    vendor: (id: string) => `/marketplace/vendors/${id}`,
    vendorInquire: (id: string) => `/marketplace/vendors/${id}/inquire`,
    vendorInquiries: (id: string) => `/marketplace/vendors/${id}/inquiries`,
    classifieds: '/marketplace/classifieds',
    classified: (id: string) => `/marketplace/classifieds/${id}`,
    classifiedFavorite: (id: string) => `/marketplace/classifieds/${id}/favorite`,
  },

  // Centre Portal
  centre: {
    dashboard: '/centre/dashboard',
    members: '/centre/members',
    member: (id: string) => `/centre/members/${id}`,
    registerWalkin: '/centre/members/register',
    memberChanges: (id: string) => `/centre/members/${id}/changes`,
    walkinRegistrations: '/centre/walkin-registrations',
    appointments: '/centre/appointments',
    appointmentSlots: '/centre/slots',
    bookAppointment: (slotId: string) => `/centre/appointments/${slotId}/book`,
    cancelAppointment: (id: string) => `/centre/appointments/${id}`,
    offlinePayment: '/centre/payments/offline',
    staff: '/centre/staff',
    addStaff: '/centre/staff',
    updateStaff: (id: string) => `/centre/staff/${id}`,
    removeStaff: (id: string) => `/centre/staff/${id}`,
    reports: {
      dashboard: '/centre/reports/dashboard',
      commissions: '/centre/reports/commissions'
    },
    approvals: {
      pending: '/centre/approvals/pending'
    }
  },

  // Documents
  documents: {
    list: '/documents',
    upload: '/documents/upload',
    document: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`
  }
} as const;
