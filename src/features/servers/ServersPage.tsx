import { ActionIcon, Badge, Button, Card, Group, Menu, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBrandMinecraft, IconDots, IconPlayerPlay, IconTerminal2 } from '@tabler/icons-react';
import type { MinecraftProfile } from '../../api/types';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { EmptyState } from '../../shared/components/EmptyState';

interface Props {
  profiles: MinecraftProfile[];
  selectedProfile: string;
  onSelect: (name: string) => void;
  onAction: (action: 'start' | 'stop' | 'restart' | 'kill', profile: string) => void;
  onGo: (page: string) => void;
}

export function ServersPage({ profiles, selectedProfile, onSelect, onAction, onGo }: Props) {
  if (!profiles.length) return <EmptyState title="No Minecraft profiles" description="Create your first Velocity, Paper or Purpur profile from Installer." action={<Button onClick={() => onGo('installer')}>Open installer</Button>} />;

  return (
    <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
      {profiles.map((profile) => (
        <Card key={profile.name} withBorder radius="lg" padding="lg" style={{ borderColor: profile.name === selectedProfile ? '#818cf8' : undefined }}>
          <Group justify="space-between" align="flex-start">
            <Group gap="sm"><ThemeIcon color={profile.running ? 'teal' : 'gray'} variant="light" size="lg"><IconBrandMinecraft size={18} /></ThemeIcon><div><Text fw={700}>{profile.name}</Text><Text size="xs" c="dimmed">{profile.type || 'minecraft'} • port {profile.port || '—'}</Text></div></Group>
            <Menu shadow="md" width={165} position="bottom-end">
              <Menu.Target><ActionIcon variant="subtle" color="gray"><IconDots size={18} /></ActionIcon></Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => onAction('restart', profile.name)}>Restart</Menu.Item>
                <Menu.Item color="orange" onClick={() => onAction('stop', profile.name)}>Stop server</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" onClick={() => onAction('kill', profile.name)}>Force kill</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Stack gap="xs" mt="lg"><StatusBadge running={profile.running} /><Text size="xs" c="dimmed" lineClamp={1}>{profile.workdir || 'No workdir reported'}</Text></Stack>
          <Group mt="lg" grow>
            <Button variant={profile.running ? 'default' : 'filled'} leftSection={<IconPlayerPlay size={16} />} onClick={() => onAction(profile.running ? 'stop' : 'start', profile.name)}>{profile.running ? 'Stop' : 'Start'}</Button>
            <Button variant="light" leftSection={<IconTerminal2 size={16} />} onClick={() => { onSelect(profile.name); onGo('console'); }}>Console</Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
