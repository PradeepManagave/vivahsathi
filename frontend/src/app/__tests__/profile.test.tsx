import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/[locale]/(main)/profile/[id]/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: '123', locale: 'en' }),
}));

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: '123',
        firstName: 'Priya',
        lastName: 'Sharma',
        age: 28,
        gender: 'female',
        religion: 'Hindu',
        city: 'Mumbai',
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    }),
  },
}));

describe('Profile Page', () => {
  it('renders profile details', async () => {
    render(<ProfilePage />);
    expect(await screen.findByText(/priya sharma/i)).toBeInTheDocument();
    expect(await screen.findByText(/28/i)).toBeInTheDocument();
  });
});
