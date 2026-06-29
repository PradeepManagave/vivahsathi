import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    expect(screen.getByText('Test').className).toContain('custom-class');
  });
});
