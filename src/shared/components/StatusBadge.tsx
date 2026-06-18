import { Badge } from '@mantine/core';

export function StatusBadge({ running }: { running?: boolean }) {
  return <Badge color={running ? 'teal' : 'gray'} variant="light">{running ? 'Running' : 'Stopped'}</Badge>;
}
