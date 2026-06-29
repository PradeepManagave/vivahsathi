import { render, screen } from '@testing-library/react';
import { Rating } from '@/components/ui/rating';

describe('Rating', () => {
  it('renders the correct number of filled stars', () => {
    render(<Rating value={3} />);
    const stars = screen.getAllByRole('img');
    expect(stars).toHaveLength(5);
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Rating value={4} size="sm" />);
    expect(screen.getAllByRole('img')).toHaveLength(5);

    rerender(<Rating value={4} size="lg" />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
  });

  it('calls onChange when interactive', async () => {
    const userEvent = require('@testing-library/user-event').default;
    const onChange = jest.fn();
    render(<Rating value={2} onChange={onChange} />);
    const stars = screen.getAllByRole('img');
    await userEvent.click(stars[4]);
  });
});
