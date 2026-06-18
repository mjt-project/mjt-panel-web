import type { ReactNode } from 'react';
import { Center, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Paper withBorder radius="lg" p="xl">
      <Center>
        <Stack align="center" maw={430} ta="center">
          <ThemeIcon size={48} radius="xl" color="gray" variant="light"><IconMoodEmpty size={25} /></ThemeIcon>
          <Title order={3}>{title}</Title>
          <Text c="dimmed" size="sm">{description}</Text>
          {action}
        </Stack>
      </Center>
    </Paper>
  );
}
