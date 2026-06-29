import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="success">Success</Alert>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<Alert variant="info">Info</Alert>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Title" variant="info">Content</Alert>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onClose when dismissible', async () => {
    const userEvent = require('@testing-library/user-event').default;
    const onClose = jest.fn();
    render(<Alert dismissible onClose={onClose}>Dismiss me</Alert>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
