import type { ReactNode } from 'react';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconActivity, IconArrowUpRight, IconCloud, IconNetwork, IconPlus,
  IconServer, IconSparkles, IconTerminal2,
} from '@tabler/icons-react';
import type { ServerProfile } from '../../api/types';

interface Props {
  servers: ServerProfile[];
  loading: boolean;
  onCreate: () => void;
  onManage: (server: ServerProfile) => void;
  onRefresh: () => void;
  onServices: () => void;
  onNetwork: () => void;
}

export function HomePage({ servers, loading, onCreate, onManage, onRefresh, onServices, onNetwork }: Props) {
  const running = servers.filter((server) => server.running).length;
  const stopped = Math.max(0, servers.length - running);

  return (
    <Stack gap="xl" pb={36}>
      <section className="mjt-hero">
        <Group justify="space-between" align="flex-start" gap="xl" wrap="wrap">
          <div>
            <Badge variant="light" color="indigo" leftSection={<IconSparkles size={13} />}>MJT workspace</Badge>
            <h1 className="mjt-hero-title">Operate everything without living in the terminal.</h1>
            <p className="mjt-hero-copy">
              Minecraft servers, PRoot applications and public routes are grouped into one workspace.
              Start with what needs attention, then drill into the exact service.
            </p>
          </div>
          <Group align="center">
            <Button variant="default" loading={loading} onClick={onRefresh}>Refresh data</Button>
            <Button leftSection={<IconPlus size={17} />} onClick={onCreate}>Create Minecraft server</Button>
          </Group>
        </Group>
      </section>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Metric icon={<IconServer size={19} />} label="Minecraft profiles" value={servers.length} detail="Registered workspaces" tone="indigo" />
        <Metric icon={<IconActivity size={19} />} label="Running now" value={running} detail={running ? 'Processes responding' : 'No server process is running'} tone="teal" />
        <Metric icon={<IconTerminal2 size={19} />} label="Needs attention" value={stopped} detail={stopped ? 'Stopped profiles are ready to start' : 'All profiles are online'} tone="orange" />
      </SimpleGrid>

      <section>
        <Group justify="space-between" mb="md" align="end">
          <div>
            <Text className="mjt-section-title">Minecraft workspaces</Text>
            <Text size="sm" className="mjt-subtle" mt={4}>Choose a server to open console, files and runtime controls.</Text>
          </div>
          <Button variant="subtle" rightSection={<IconArrowUpRight size={15} />} onClick={onCreate}>New profile</Button>
        </Group>
        {servers.length ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {servers.map((server) => <WorkspaceCard key={server.name} server={server} onManage={onManage} />)}
          </SimpleGrid>
        ) : (
          <div className="mjt-empty-state">
            <Stack align="center" gap="sm">
              <ThemeIcon size={48} radius="xl" variant="light" color="indigo"><IconServer size={23} /></ThemeIcon>
              <Text fw={700}>No Minecraft workspaces yet</Text>
              <Text size="sm" className="mjt-subtle" maw={420}>Create the first profile and MJT will prepare the server folder, jar and start script.</Text>
              <Button mt="xs" leftSection={<IconPlus size={16} />} onClick={onCreate}>Create a server</Button>
            </Stack>
          </div>
        )}
      </section>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card className="mjt-network-card" padding="lg">
          <Group justify="space-between" align="flex-start">
            <ThemeIcon size={42} radius="xl" variant="light" color="violet"><IconCloud size={21} /></ThemeIcon>
            <Button variant="subtle" size="compact-sm" rightSection={<IconArrowUpRight size={14} />} onClick={onServices}>Open services</Button>
          </Group>
          <Text fw={720} mt="lg">Run applications in PRoot</Text>
          <Text size="sm" className="mjt-subtle" mt={5}>Manage Node, Java, Python and OpenVSCode workloads as named services with restart and health policies.</Text>
        </Card>
        <Card className="mjt-network-card" padding="lg">
          <Group justify="space-between" align="flex-start">
            <ThemeIcon size={42} radius="xl" variant="light" color="cyan"><IconNetwork size={21} /></ThemeIcon>
            <Button variant="subtle" size="compact-sm" rightSection={<IconArrowUpRight size={14} />} onClick={onNetwork}>View network</Button>
          </Group>
          <Text fw={720} mt="lg">Publish only what you choose</Text>
          <Text size="sm" className="mjt-subtle" mt={5}>Services stay on loopback. Cloudflare routes are shown separately, so exposure is always visible before you share a link.</Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

function Metric({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: number; detail: string; tone: string }) {
  return (
    <Card className="mjt-metric-card" padding="lg">
      <Group justify="space-between" align="flex-start">
        <ThemeIcon variant="light" color={tone} radius="xl" size={40}>{icon}</ThemeIcon>
        <Text size="xs" className="mjt-subtle" tt="uppercase" fw={700}>{label}</Text>
      </Group>
      <div className="mjt-metric-value">{value}</div>
      <Text size="sm" className="mjt-subtle">{detail}</Text>
    </Card>
  );
}

function WorkspaceCard({ server, onManage }: { server: ServerProfile; onManage: (server: ServerProfile) => void }) {
  const running = Boolean(server.running);
  return (
    <Card className="mjt-workspace-card" padding="lg">
      <Group justify="space-between" align="flex-start">
        <ThemeIcon size={42} radius="xl" variant="light" color={running ? 'teal' : 'gray'}><IconServer size={20} /></ThemeIcon>
        <Badge color={running ? 'teal' : 'gray'} variant="light">{running ? 'Running' : 'Stopped'}</Badge>
      </Group>
      <Text fw={760} fz="lg" mt="xl">{server.name}</Text>
      <Text size="sm" className="mjt-subtle" mt={4}>{server.type || 'Minecraft'} · local port {server.port ?? '—'}</Text>
      <Text size="xs" className="mjt-subtle" mt={14} lineClamp={1}>{server.workdir || 'Workspace path unavailable'}</Text>
      <Button fullWidth mt="lg" variant={running ? 'light' : 'default'} onClick={() => onManage(server)}>
        Manage workspace
      </Button>
    </Card>
  );
}
