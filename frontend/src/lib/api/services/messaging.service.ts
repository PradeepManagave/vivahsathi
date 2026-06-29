import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Interest, Message, PaginationMeta } from '@/types';

export interface SendInterestData {
  receiverId: string;
  message?: string;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'document';
  mediaUrl?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline: boolean;
}

export class MessagingService {
  async sendInterest(data: SendInterestData): Promise<Interest> {
    const response = await apiClient.post<Interest>(
      API_ENDPOINTS.interests.send,
      data
    );
    return response.data as Interest;
  }

  async acceptInterest(interestId: string): Promise<Interest> {
    const response = await apiClient.post<Interest>(
      API_ENDPOINTS.interests.accept(interestId)
    );
    return response.data as Interest;
  }

  async rejectInterest(interestId: string): Promise<Interest> {
    const response = await apiClient.post<Interest>(
      API_ENDPOINTS.interests.reject(interestId)
    );
    return response.data as Interest;
  }

  async cancelInterest(interestId: string): Promise<Interest> {
    const response = await apiClient.post<Interest>(
      API_ENDPOINTS.interests.cancel(interestId)
    );
    return response.data as Interest;
  }

  async getReceivedInterests(page = 1, limit = 20): Promise<{ data: Interest[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Interest[]; meta: PaginationMeta }>(
      API_ENDPOINTS.interests.received,
      { page, limit }
    );
    return response.data as { data: Interest[]; meta: PaginationMeta };
  }

  async getSentInterests(page = 1, limit = 20): Promise<{ data: Interest[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Interest[]; meta: PaginationMeta }>(
      API_ENDPOINTS.interests.sent,
      { page, limit }
    );
    return response.data as { data: Interest[]; meta: PaginationMeta };
  }

  async getMatches(page = 1, limit = 20): Promise<{ data: Interest[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Interest[]; meta: PaginationMeta }>(
      API_ENDPOINTS.matches.list,
      { page, limit }
    );
    return response.data as { data: Interest[]; meta: PaginationMeta };
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<Message>(
      API_ENDPOINTS.messages.send,
      data
    );
    return response.data as Message;
  }

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{ data: Message[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Message[]; meta: PaginationMeta }>(
      API_ENDPOINTS.messages.byConversation(conversationId),
      { page, limit }
    );
    return response.data as { data: Message[]; meta: PaginationMeta };
  }

  async getConversations(page = 1, limit = 20): Promise<{ data: Conversation[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Conversation[]; meta: PaginationMeta }>(
      API_ENDPOINTS.messages.conversations,
      { page, limit }
    );
    return response.data as { data: Conversation[]; meta: PaginationMeta };
  }

  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.markRead(conversationId));
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.markRead('all'));
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.messages.conversations
    );
    return (response.data as { count: number }).count;
  }
}

export const messagingService = new MessagingService();
