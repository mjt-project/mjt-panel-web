import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Code, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCode, IconCpu, IconDatabase, IconDownload, IconRefresh, IconServer } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';
import type { CoreStatus, SystemStatus } from '../../api/types';

interface Props { api: MjtApi; status: CoreStatus | null; }

export function SystemPage({ api, status }: Props) {
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setSystem(await api.getSystem()); }
    catch (error) { notifications.show({ color: 'red', title: 'Could not load system status', message: error instanceof Error ? error.message : 'Unknown error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Stack gap="lg">
      <Group justify="space-between"><div><Title order={2}>System</Title><Text c="dimmed">MJT Core and panel runtime details.</Text></div><Button variant="default" leftSection={<IconRefresh size={16} />} loading={loading} onClick={load}>Refresh</Button></Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Metric icon={<IconServer size={18} />} label="Core version" value={status?.version || 'unknown'} detail={`up ${status?.uptime || 'unknown'}`} />
        <Metric icon={<IconCode size={18} />} label="Java" value={system?.java || 'unknown'} detail={system?.architecture || 'unknown'} />
        <Metric icon={<IconCpu size={18} />} label="Memory" value={system?.memory || 'unknown'} detail={system?.os || 'unknown'} />
        <Metric icon={<IconDatabase size={18} />} label="Disk" value={system?.disk || 'unknown'} detail="container storage" />
      </SimpleGrid>
      <Alert color="indigo" variant="light">The panel is a static frontend. Node.js, Vite and the React build toolchain are used only during development/release builds, not while MJT serves this panel.</Alert>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="lg" padding="lg"><Title order={3} mb="md">Frontend runtime</Title><List spacing="sm"><List.Item>Static root: <Code>/home/container/MJT/panel/static</Code></List.Item><List.Item>Frontend release: <Code>{system?.panelFrontend || 'unknown'}</Code></List.Item><List.Item>Panel listener: <Code>{status?.panelUrl || 'http://127.0.0.1:9090'}</Code></List.Item><List.Item>Cloudflared: <Code>{system?.cloudflared || 'not reported'}</Code></List.Item></List></Card>
        <Card withBorder radius="lg" padding="lg"><Title order={3} mb="md">Service health</Title><Stack gap="sm"><Health label="Panel API" status="healthy" /><Health label="Minecraft process manager" status="healthy" /><Health label="External panel frontend" status="healthy" /><Health label="Cloudflare Tunnel" status={system?.cloudflared && system.cloudflared !== 'not installed' ? 'healthy' : 'not-configured'} /></Stack></Card>
      </SimpleGrid>
      <Card withBorder radius="lg" padding="lg"><Group justify="space-between"><div><Title order={3}>Maintenance</Title><Text size="sm" c="dimmed">Use the MJT terminal commands for core updates and service lifecycle.</Text></div><ThemeIcon size="lg" variant="light" color="indigo"><IconDownload size={18} /></ThemeIcon></Group><Group mt="md" gap="xs"><Code>.mjt panel update</Code><Code>.mjt panel restart</Code><Code>.mjt system install cloudflared</Code></Group></Card>
    </Stack>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Paper withBorder radius="lg" p="md"><Group justify="space-between"><div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text><Text fw={700}>{value}</Text><Text size="xs" c="dimmed">{detail}</Text></div><ThemeIcon variant="light" color="indigo" size="lg">{icon}</ThemeIcon></Group></Paper>;
}
function Health({ label, status }: { label: string; status: 'healthy' | 'not-configured' }) { return <Group justify="space-between"><Text size="sm">{label}</Text><Badge variant="light" color={status === 'healthy' ? 'teal' : 'gray'}>{status === 'healthy' ? 'Healthy' : 'Not configured'}</Badge></Group>; }
