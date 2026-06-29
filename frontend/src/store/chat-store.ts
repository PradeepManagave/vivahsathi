import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantIsOnline: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isInterestAccepted: boolean;
}

export interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;

  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: ChatConversation) => void;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  removeConversation: (id: string) => void;
  markConversationRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      loading: false,
      error: null,

      setConversations: (conversations) => set({ conversations }),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations]
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          )
        })),

      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
        })),

      markConversationRead: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c
          )
        })),

      markAllRead: () =>
        set((state) => ({
          conversations: state.conversations.map((c) => ({ ...c, unreadCount: 0 }))
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clear: () => set({ conversations: [], activeConversationId: null, loading: false, error: null })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId
      })
    }
  )
);

export const useConversations = () => useChatStore((state) => state.conversations);
export const useActiveConversationId = () => useChatStore((state) => state.activeConversationId);
export const useTotalUnreadChats = () =>
  useChatStore((state) =>
    state.conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  );
