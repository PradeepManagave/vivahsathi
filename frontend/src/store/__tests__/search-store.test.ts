import { renderHook, act } from '@testing-library/react';
import { useSearchStore } from '@/store/search-store';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('searchStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchStore.setState({ results: [], loading: false, error: null, filters: {}, savedSearches: [], suggestions: [] });
  });

  it('has initial state', () => {
    const { result } = renderHook(() => useSearchStore());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('performs search', async () => {
    const mockResults = [{ id: '1', name: 'Test' }];
    (apiClient.get as jest.Mock).mockResolvedValue({ success: true, data: { data: mockResults, pagination: { total: 1, pages: 1 } } });

    const { result } = renderHook(() => useSearchStore());
    await act(async () => { await result.current.search({ gender: 'female' }); });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.loading).toBe(false);
  });

  it('sets filters', () => {
    const { result } = renderHook(() => useSearchStore());
    act(() => { result.current.setFilters({ ageMin: 25, ageMax: 35 }); });
    expect(result.current.filters.ageMin).toBe(25);
  });
});
