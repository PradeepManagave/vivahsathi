import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NativeSelect } from '@/components/ui/select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders with label', () => {
    render(<NativeSelect label="Choose" options={options} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<NativeSelect label="Choose" options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', async () => {
    const onChange = jest.fn();
    render(<NativeSelect label="Choose" options={options} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Choose'), 'option2');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders error message', () => {
    render(<NativeSelect label="Choose" options={options} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});

