import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: 'Badge' },
};

export const Success: Story = {
  args: { children: 'Verified', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

export const Warning: Story = {
  args: { children: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
};

export const Error: Story = {
  args: { children: 'Rejected', className: 'bg-red-100 text-red-700 border-red-300' },
};
