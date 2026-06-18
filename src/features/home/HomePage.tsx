import { useMemo, useState } from 'react';
import { ActionIcon, Badge, Box, Button, Card, Center, Group, Paper, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { IconCubePlus, IconRefresh, IconSearch, IconServer, IconSparkles } from '@tabler/icons-react';
import type { ServerProfile } from '../../api/types';

interface Props {
  servers: ServerProfile[];
  loading: boolean;
  onCreate: () => void;
  onManage: (server: ServerProfile) => void;
  onRefresh: () => void;
}

function softwareColor(type: string) {
  if (type.includes('velocity')) return 'violet';
  if (type.includes('paper')) return 'blue';
  if (type.includes('purpur')) return 'grape';
  return 'gray';
}

export function HomePage({ servers, loading, onCreate, onManage, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => servers.filter((server) => server.name.toLowerCase().includes(search.toLowerCase())), [servers, search]);
  const running = servers.filter((server) => server.running).length;

  return (
    <Box className="mjt-page-shell">
      <Box maw={1180} mx="auto" px="md" py={28}>
        <Group justify="space-between" align="center" mb={42}>
          <Group gap="sm">
            <div className="mjt-logo">M</div>
            <div>
              <Text fw={700}>MJT Panel</Text>
              <Text c="dimmed" size="xs">Server workspace control</Text>
            </div>
          </Group>
          <Group>
            <Tooltip label="Refresh servers">
              <ActionIcon variant="subtle" size="lg" onClick={onRefresh} loading={loading}><IconRefresh size={18} /></ActionIcon>
            </Tooltip>
            <Badge variant="light" color="teal" radius="sm">{running} running</Badge>
          </Group>
        </Group>

        <Group justify="space-between" align="flex-end" gap="lg" mb={28}>
          <Stack gap={6}>
            <Group gap={8}><ThemeIcon variant="light" color="indigo"><IconSparkles size={16} /></ThemeIcon><Text c="indigo.7" fw={600} size="sm">Good to see you</Text></Group>
            <Title order={1} fz={{ base: 30, sm: 38 }} fw={650}>Your servers</Title>
            <Text c="dimmed" maw={580}>Create a server or choose one below to open its management workspace.</Text>
          </Stack>
          <Button size="md" leftSection={<IconCubePlus size={18} />} onClick={onCreate}>Create server</Button>
        </Group>

        <Paper p="sm" mb="lg" shadow="xs">
          <TextInput value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} placeholder="Search servers" variant="unstyled" px="sm" />
        </Paper>

        {filtered.length === 0 ? (
          <Center py={72}>
            <Stack align="center" gap="sm">
              <ThemeIcon size={54} radius="xl" variant="light" color="indigo"><IconServer size={28} /></ThemeIcon>
              <Title order={3}>No servers yet</Title>
              <Text c="dimmed" ta="center">Start by creating a Velocity proxy, Paper server or Purpur server.</Text>
              <Button mt="sm" leftSection={<IconCubePlus size={16} />} onClick={onCreate}>Create your first server</Button>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filtered.map((server) => (
              <Card key={server.name} className="mjt-server-card" padding="lg" shadow="xs">
                <Group justify="space-between" align="flex-start" mb="xl">
                  <ThemeIcon size={42} radius="md" variant="light" color={softwareColor(server.type)}><IconServer size={21} /></ThemeIcon>
                  <Badge variant="light" color={server.running ? 'teal' : 'gray'}>{server.running ? 'Running' : 'Stopped'}</Badge>
                </Group>
                <Text fw={650} size="lg">{server.name}</Text>
                <Text c="dimmed" size="sm" mt={4}>{server.type} · port {server.port ?? '—'}</Text>
                <Text c="dimmed" size="xs" lineClamp={1} mt={4}>{server.workdir || 'Workspace path not reported'}</Text>
                <Button mt="xl" fullWidth variant={server.running ? 'light' : 'filled'} onClick={() => onManage(server)}>Manage server</Button>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
