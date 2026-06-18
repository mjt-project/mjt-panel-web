import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Code, Group, Paper, SimpleGrid, Stack, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCloud, IconExternalLink, IconNetwork, IconRefresh, IconRouter, IconServer } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';
import type { NetworkStatus } from '../../api/types';

interface Props { api: MjtApi; }

export function NetworkPage({ api }: Props) {
  const [network, setNetwork] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setNetwork(await api.getNetwork()); }
    catch (error) { notifications.show({ color: 'red', title: 'Could not load network status', message: error instanceof Error ? error.message : 'Unknown error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const tunnelColor = network?.tunnel?.status === 'online' ? 'teal' : network?.tunnel?.status === 'offline' ? 'gray' : 'yellow';
  return (
    <Stack gap="lg">
      <Group justify="space-between"><div><Title order={2}>Network</Title><Text c="dimmed">Local services, public access and server ports.</Text></div><Button variant="default" leftSection={<IconRefresh size={16} />} loading={loading} onClick={load}>Refresh</Button></Group>
      <Alert color="indigo" variant="light">Keep the panel and internal Minecraft services bound to <Code>127.0.0.1</Code> by default. Enable public routes only when you intentionally configure them.</Alert>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <InfoCard icon={<IconServer size={18} />} title="Panel" value={network?.panelUrl || 'Not reported'} detail="MJT panel listener" />
        <InfoCard icon={<IconRouter size={18} />} title="Gateway" value={network?.gateway?.enabled ? 'Enabled' : 'Disabled'} detail={network?.gateway?.host ? `${network.gateway.host}:${network.gateway.port || '—'}` : 'No route configured'} />
        <InfoCard icon={<IconCloud size={18} />} title="Tunnel" value={network?.tunnel?.mode || 'local'} detail={network?.tunnel?.url || `${network?.tunnel?.status || 'unknown'} status`} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card withBorder radius="lg" padding="lg">
          <Group justify="space-between" mb="md"><div><Title order={3}>Panel access</Title><Text size="sm" c="dimmed">Where this management interface is reachable.</Text></div><ThemeIcon variant="light" color="indigo" size="lg"><IconNetwork size={18} /></ThemeIcon></Group>
          <Stack gap="md">
            <AddressRow label="Local URL" value={network?.localPanelUrl || 'http://127.0.0.1:9090'} />
            <AddressRow label="Public URL" value={network?.tunnel?.url || 'Not enabled'} external={Boolean(network?.tunnel?.url)} />
            <Group gap="xs"><Badge color={tunnelColor} variant="light">{network?.tunnel?.status || 'unknown'}</Badge><Text size="sm" c="dimmed">Tunnel mode: {network?.tunnel?.mode || 'local'}</Text></Group>
          </Stack>
        </Card>

        <Card withBorder radius="lg" padding="lg">
          <Title order={3} mb="xs">Safe defaults</Title>
          <Stack gap="sm"><Safety text="Panel binds locally unless explicitly exposed." /><Safety text="Minecraft backend profiles can remain local behind Velocity." /><Safety text="SSH and public tunnels should require separate explicit configuration." /></Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" mb="md"><div><Title order={3}>Service ports</Title><Text size="sm" c="dimmed">Reported listeners and route targets.</Text></div><Badge variant="light" color="indigo">{network?.ports?.length || 0} entries</Badge></Group>
        <Table verticalSpacing="sm" highlightOnHover><Table.Thead><Table.Tr><Table.Th>Service</Table.Th><Table.Th>Address</Table.Th><Table.Th>Protocol</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{(network?.ports || []).map((port) => <Table.Tr key={`${port.label}-${port.port}`}><Table.Td><Text fw={600}>{port.label}</Text></Table.Td><Table.Td><Code>{port.host}:{port.port}</Code></Table.Td><Table.Td><Badge variant="light" color="gray">{port.protocol}</Badge></Table.Td><Table.Td><Badge variant="light" color={port.status === 'open' ? 'teal' : port.status === 'closed' ? 'gray' : 'yellow'}>{port.status}</Badge></Table.Td></Table.Tr>)}</Table.Tbody></Table>
      </Card>
    </Stack>
  );
}

function InfoCard({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) {
  return <Paper withBorder radius="lg" p="md"><Group justify="space-between"><div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text><Text fw={700}>{value}</Text><Text size="xs" c="dimmed">{detail}</Text></div><ThemeIcon variant="light" color="indigo" size="lg">{icon}</ThemeIcon></Group></Paper>;
}

function AddressRow({ label, value, external = false }: { label: string; value: string; external?: boolean }) {
  return <Group justify="space-between" align="flex-start"><div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text><Code>{value}</Code></div>{external && <Button size="compact-sm" variant="subtle" rightSection={<IconExternalLink size={13} />} component="a" href={value} target="_blank">Open</Button>}</Group>;
}

function Safety({ text }: { text: string }) { return <Group gap="sm"><ThemeIcon size="sm" radius="xl" color="teal" variant="light">✓</ThemeIcon><Text size="sm">{text}</Text></Group>; }
