import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'Try adjusting your search or filters.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Users className="w-12 h-12" />,
    title: 'No matches yet',
    description: 'Start exploring profiles to find your perfect match.',
  },
};
