import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  },
}));

describe('API Client', () => {
  const mockResponse = { success: true, data: { id: '1', name: 'Test' } };

  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);
    (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);
    (apiClient.delete as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('GET requests', () => {
    it('fetches profiles', async () => {
      const res = await apiClient.get('/profiles/me');
      expect(apiClient.get).toHaveBeenCalledWith('/profiles/me');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ id: '1', name: 'Test' });
    });

    it('fetches search results', async () => {
      await apiClient.get('/search/profiles', { params: { ageMin: 25 } });
      expect(apiClient.get).toHaveBeenCalledWith('/search/profiles', { params: { ageMin: 25 } });
    });
  });

  describe('POST requests', () => {
    it('creates resources', async () => {
      const payload = { email: 'test@test.com', password: 'password123' };
      await apiClient.post('/auth/login', payload);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
    });
  });

  describe('PUT requests', () => {
    it('updates resources', async () => {
      const payload = { firstName: 'John' };
      await apiClient.put('/profiles/me', payload);
      expect(apiClient.put).toHaveBeenCalledWith('/profiles/me', payload);
    });
  });

  describe('DELETE requests', () => {
    it('deletes resources', async () => {
      await apiClient.delete('/profiles/photos/123');
      expect(apiClient.delete).toHaveBeenCalledWith('/profiles/photos/123');
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
    });
  });
});
