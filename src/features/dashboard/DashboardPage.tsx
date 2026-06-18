import { ActionIcon, Badge, Button, Card, Grid, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBrandMinecraft, IconFolder, IconPlayerPlay, IconTerminal2 } from '@tabler/icons-react';
import type { CoreStatus, MinecraftProfile } from '../../api/types';
import { StatusBadge } from '../../shared/components/StatusBadge';

interface Props {
  status: CoreStatus | null;
  profiles: MinecraftProfile[];
  selectedProfile: string;
  demo: boolean;
  onSelect: (name: string) => void;
  onStart: (name: string) => void;
  onGo: (page: string) => void;
}

export function DashboardPage({ status, profiles, selectedProfile, demo, onSelect, onStart, onGo }: Props) {
  const current = profiles.find((profile) => profile.name === selectedProfile);
  const running = profiles.filter((profile) => profile.running).length;

  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p="xl" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 65%)' }}>
        <Group justify="space-between" align="flex-start" gap="lg">
          <Stack gap={6}>
            <Text size="xs" fw={700} c="indigo" tt="uppercase">Selected profile</Text>
            <Title order={1}>{current?.name || 'No profile selected'}</Title>
            <Text c="dimmed">{current ? `${current.type || 'minecraft'} • ${current.workdir || 'No workdir reported'}` : 'Install a server or choose a configured profile.'}</Text>
            <Group mt="sm">
              {current && <StatusBadge running={current.running} />}
              <Badge variant="outline" color="gray">{demo ? 'Demo mode' : 'Live API'}</Badge>
            </Group>
          </Stack>
          <Group align="center">
            <Button leftSection={<IconPlayerPlay size={16} />} disabled={!current || current.running} onClick={() => current && onStart(current.name)}>Start</Button>
            <Button variant="default" leftSection={<IconTerminal2 size={16} />} disabled={!current} onClick={() => onGo('console')}>Console</Button>
          </Group>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Metric label="Core" value={status?.version || 'Unknown'} icon={<IconBrandMinecraft size={18} />} />
        <Metric label="Running" value={String(running)} icon={<IconPlayerPlay size={18} />} />
        <Metric label="Profiles" value={String(profiles.length)} icon={<IconFolder size={18} />} />
        <Metric label="Access" value={status?.remote || 'local'} icon={<IconTerminal2 size={18} />} />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="lg" padding="lg">
            <Group justify="space-between" mb="md"><Title order={3}>Profiles</Title><Button variant="subtle" onClick={() => onGo('servers')}>Manage servers</Button></Group>
            <Stack gap="sm">
              {profiles.map((profile) => (
                <Paper key={profile.name} withBorder radius="md" p="md" style={{ cursor: 'pointer', borderColor: profile.name === selectedProfile ? '#818cf8' : undefined }} onClick={() => onSelect(profile.name)}>
                  <Group justify="space-between">
                    <Group gap="sm"><ThemeIcon variant="light" color={profile.running ? 'teal' : 'gray'}><IconBrandMinecraft size={16} /></ThemeIcon><div><Text fw={600}>{profile.name}</Text><Text size="xs" c="dimmed">{profile.type || 'minecraft'} • {profile.port || 'no port'}</Text></div></Group>
                    <StatusBadge running={profile.running} />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="lg" padding="lg">
            <Title order={3} mb="md">Next step</Title>
            <Stack gap="sm">
              <Checklist done={Boolean(status)} text="Panel token and API connection are ready" />
              <Checklist done={profiles.length > 0} text="At least one Minecraft profile exists" />
              <Checklist done={Boolean(selectedProfile)} text="A profile is selected for console actions" />
              <Button variant="light" onClick={() => onGo('installer')}>Install Velocity, Paper or Purpur</Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card withBorder radius="lg" padding="md"><Group justify="space-between"><div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text><Text fw={700} size="lg">{value}</Text></div><ThemeIcon variant="light" color="indigo" size="lg">{icon}</ThemeIcon></Group></Card>;
}

function Checklist({ done, text }: { done: boolean; text: string }) {
  return <Group gap="sm"><ThemeIcon size="sm" radius="xl" color={done ? 'teal' : 'gray'} variant="light">{done ? '✓' : '•'}</ThemeIcon><Text size="sm" c={done ? 'dark' : 'dimmed'}>{text}</Text></Group>;
}
