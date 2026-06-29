import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="Nothing to show here" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState icon={<Users data-testid="empty-icon" />} title="Empty" />);
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(<EmptyState title="Empty" action={<button>Create</button>} />);
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
});
