// ============================================================
// App Store - Global Application State
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Notification, PaginationParams } from '@/types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: string;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  notificationPanelOpen: boolean;
  
  // Search State
  recentSearches: string[];
  savedSearches: SearchSave[];
  
  // Filters
  searchFilters: Record<string, unknown>;
  
  // Toast Queue
  toasts: Toast[];
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: string) => void;
  
  // Notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  toggleNotificationPanel: () => void;
  
  // Search
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  saveSearch: (search: SearchSave) => void;
  removeSavedSearch: (id: string) => void;
  
  // Filters
  setSearchFilters: (filters: Record<string, unknown>) => void;
  clearSearchFilters: () => void;
  
  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface SearchSave {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarOpen: true,
      mobileNavOpen: false,
      theme: 'system',
      locale: 'en',
      
      notifications: [],
      unreadCount: 0,
      notificationPanelOpen: false,
      
      recentSearches: [],
      savedSearches: [],
      
      searchFilters: {},
      
      toasts: [],
      
      // UI Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
      
      setTheme: (theme) => set({ theme }),
      
      setLocale: (locale) => {
        set({ locale });
        if (typeof window !== 'undefined') {
          document.documentElement.lang = locale;
          document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        }
      },
      
      // Notification Actions
      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
      })),
      
      markAsRead: (notificationId) => set((state) => {
        const notifications = state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        return {
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length
        };
      }),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })),
      
      toggleNotificationPanel: () => set((state) => ({
        notificationPanelOpen: !state.notificationPanelOpen
      })),
      
      // Search Actions
      addRecentSearch: (query) => set((state) => {
        const searches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10);
        return { recentSearches: searches };
      }),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      saveSearch: (search) => set((state) => ({
        savedSearches: [...state.savedSearches, search]
      })),
      
      removeSavedSearch: (id) => set((state) => ({
        savedSearches: state.savedSearches.filter(s => s.id !== id)
      })),
      
      // Filter Actions
      setSearchFilters: (filters) => set({ searchFilters: filters }),
      clearSearchFilters: () => set({ searchFilters: {} }),
      
      // Toast Actions
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: Date.now().toString() }]
      })),
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        recentSearches: state.recentSearches,
        savedSearches: state.savedSearches
      })
    }
  )
);

// Selectors
export const useTheme = () => useAppStore((state) => state.theme);
export const useLocale = () => useAppStore((state) => state.locale);
export const useUnreadNotifications = () => useAppStore((state) => state.unreadCount);
export const useSavedSearches = () => useAppStore((state) => state.savedSearches);
