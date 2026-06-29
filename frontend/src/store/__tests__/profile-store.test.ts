import { renderHook, act } from '@testing-library/react';
import { useProfileStore } from '@/store/profile-store';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    upload: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  gender: 'male',
  dateOfBirth: '1990-01-01',
  religion: 'Hindu',
  status: 'active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('profileStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({ profile: null, completionScore: 0, loading: false, error: null });
  });

  it('has initial state', () => {
    const { result } = renderHook(() => useProfileStore());
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches profile successfully', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { profile: mockProfile, completionScore: 75 },
    });

    const { result } = renderHook(() => useProfileStore());
    await act(async () => { await result.current.fetchProfile(); });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.completionScore).toBe(75);
    expect(result.current.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ success: false });

    const { result } = renderHook(() => useProfileStore());
    await act(async () => { await result.current.fetchProfile(); });

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('updates profile', async () => {
    const updated = { ...mockProfile, firstName: 'Jane' };
    (apiClient.put as jest.Mock).mockResolvedValue({ success: true, data: updated });

    useProfileStore.setState({ profile: mockProfile });
    const { result } = renderHook(() => useProfileStore());

    await act(async () => { await result.current.updateProfile({ firstName: 'Jane' }); });

    expect(result.current.profile?.firstName).toBe('Jane');
  });

  it('sets profile directly', () => {
    const { result } = renderHook(() => useProfileStore());
    act(() => { result.current.setProfile(mockProfile); });
    expect(result.current.profile).toEqual(mockProfile);
  });

  it('clears error', () => {
    useProfileStore.setState({ error: 'Some error' });
    const { result } = renderHook(() => useProfileStore());
    act(() => { result.current.clearError(); });
    expect(result.current.error).toBeNull();
  });
});
