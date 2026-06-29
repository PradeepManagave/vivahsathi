import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  durationDays: number;
  features: string[];
  isPopular?: boolean;
}

export interface UserMembership {
  id: string;
  planId: string;
  plan: MembershipPlan;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  contactsUsed: number;
  contactsTotal: number;
  autoRenew: boolean;
}

export interface PrepaidPack {
  id: string;
  name: string;
  description: string;
  price: number;
  contacts: number;
  durationDays: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export class MembershipService {
  async getPlans(): Promise<MembershipPlan[]> {
    const response = await apiClient.get<MembershipPlan[]>(
      API_ENDPOINTS.membership.plans
    );
    return response.data as MembershipPlan[];
  }

  async getCurrentMembership(): Promise<UserMembership | null> {
    const response = await apiClient.get<UserMembership | null>(
      API_ENDPOINTS.membership.current
    );
    return response.data as UserMembership | null;
  }

  async createOrder(planId: string, paymentMethod = 'razorpay'): Promise<PaymentOrder> {
    const response = await apiClient.post<PaymentOrder>(
      API_ENDPOINTS.membership.checkout,
      { planId, paymentMethod }
    );
    return response.data as PaymentOrder;
  }

  async cancelMembership(reason?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.membership.cancel, { reason });
  }

  async getPrepaidPacks(): Promise<PrepaidPack[]> {
    const response = await apiClient.get<PrepaidPack[]>(
      API_ENDPOINTS.membership.prepaid
    );
    return response.data as PrepaidPack[];
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.membership.checkout,
      { paymentId, orderId, signature, verify: true }
    );
    return (response.data as { success: boolean }).success;
  }
}

export const membershipService = new MembershipService();
