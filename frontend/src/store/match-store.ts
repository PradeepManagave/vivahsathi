import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  photo?: string;
  isVerified: boolean;
  isPremium: boolean;
  matchPercentage: number;
  compatibilityScore?: number;
  reason?: string;
  shortlisted: boolean;
  interestSent: boolean;
  interestReceived: boolean;
  profileViewed: boolean;
}

export interface MatchState {
  dailyMatches: MatchProfile[];
  recommendedMatches: MatchProfile[];
  shortlistedMatches: MatchProfile[];
  receivedInterests: MatchProfile[];
  sentInterests: MatchProfile[];
  viewedProfiles: MatchProfile[];

  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalMatches: number;

  setDailyMatches: (matches: MatchProfile[]) => void;
  setRecommendedMatches: (matches: MatchProfile[]) => void;
  setShortlistedMatches: (matches: MatchProfile[]) => void;
  setReceivedInterests: (matches: MatchProfile[]) => void;
  setSentInterests: (matches: MatchProfile[]) => void;
  setViewedProfiles: (profiles: MatchProfile[]) => void;

  toggleShortlist: (id: string) => void;
  markInterestSent: (id: string) => void;
  markInterestReceived: (id: string) => void;
  markInterestAccepted: (id: string) => void;
  markInterestDeclined: (id: string) => void;
  markProfileViewed: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  clear: () => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      dailyMatches: [],
      recommendedMatches: [],
      shortlistedMatches: [],
      receivedInterests: [],
      sentInterests: [],
      viewedProfiles: [],

      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalMatches: 0,

      setDailyMatches: (matches) => set({ dailyMatches: matches }),
      setRecommendedMatches: (matches) => set({ recommendedMatches: matches }),
      setShortlistedMatches: (matches) => set({ shortlistedMatches: matches }),
      setReceivedInterests: (matches) => set({ receivedInterests: matches }),
      setSentInterests: (matches) => set({ sentInterests: matches }),
      setViewedProfiles: (profiles) => set({ viewedProfiles: profiles }),

      toggleShortlist: (id) =>
        set((state) => {
          const toggleInList = (list: MatchProfile[]) =>
            list.map((m) => (m.id === id ? { ...m, shortlisted: !m.shortlisted } : m));

          const isInShortlist = state.shortlistedMatches.some((m) => m.id === id);

          return {
            dailyMatches: toggleInList(state.dailyMatches),
            recommendedMatches: toggleInList(state.recommendedMatches),
            shortlistedMatches: isInShortlist
              ? state.shortlistedMatches.filter((m) => m.id !== id)
              : [...state.shortlistedMatches, ...(state.dailyMatches.filter((m) => m.id === id)), ...(state.recommendedMatches.filter((m) => m.id === id))].map((m) =>
                  m.id === id ? { ...m, shortlisted: true } : m
                )
          };
        }),

      markInterestSent: (id) =>
        set((state) => {
          const markInList = (list: MatchProfile[]) =>
            list.map((m) => (m.id === id ? { ...m, interestSent: true } : m));
          return {
            dailyMatches: markInList(state.dailyMatches),
            recommendedMatches: markInList(state.recommendedMatches),
            sentInterests: [
              ...state.sentInterests,
              ...(state.dailyMatches.filter((m) => m.id === id)),
              ...(state.recommendedMatches.filter((m) => m.id === id))
            ].filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
          };
        }),

      markInterestReceived: (id) =>
        set((state) => ({
          receivedInterests: [
            ...state.receivedInterests,
            ...(state.dailyMatches.filter((m) => m.id === id)),
            ...(state.recommendedMatches.filter((m) => m.id === id))
          ].filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
        })),

      markInterestAccepted: (id) =>
        set((state) => ({
          receivedInterests: state.receivedInterests.filter((m) => m.id !== id),
          sentInterests: state.sentInterests.map((m) =>
            m.id === id ? { ...m, interestSent: true } : m
          )
        })),

      markInterestDeclined: (id) =>
        set((state) => ({
          receivedInterests: state.receivedInterests.filter((m) => m.id !== id)
        })),

      markProfileViewed: (id) =>
        set((state) => {
          const profile = state.dailyMatches.find((m) => m.id === id) || state.recommendedMatches.find((m) => m.id === id);
          if (!profile) return {};
          return {
            viewedProfiles: [{ ...profile, profileViewed: true }, ...state.viewedProfiles.filter((p) => p.id !== id)]
          };
        }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPage: (page) => set({ currentPage: page }),
      clear: () => set({
        dailyMatches: [],
        recommendedMatches: [],
        shortlistedMatches: [],
        receivedInterests: [],
        sentInterests: [],
        viewedProfiles: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        totalMatches: 0
      })
    }),
    {
      name: 'match-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shortlistedMatches: state.shortlistedMatches,
        viewedProfiles: state.viewedProfiles.slice(0, 50)
      })
    }
  )
);

export const useDailyMatches = () => useMatchStore((state) => state.dailyMatches);
export const useRecommendedMatches = () => useMatchStore((state) => state.recommendedMatches);
export const useShortlistedMatches = () => useMatchStore((state) => state.shortlistedMatches);
export const useReceivedInterests = () => useMatchStore((state) => state.receivedInterests);
export const useSentInterests = () => useMatchStore((state) => state.sentInterests);
export const useViewedProfiles = () => useMatchStore((state) => state.viewedProfiles);
export const useMatchLoading = () => useMatchStore((state) => state.loading);
