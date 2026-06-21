import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Code, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowLeft, IconCloud, IconLock, IconNetwork, IconRefresh, IconRoute, IconWorld } from '@tabler/icons-react';
import { PageHeader } from '../../ui/ControlFrame';
import { type NetworkSnapshot, PanelControlApi } from '../../api/control-v1';

interface Props {
  api: PanelControlApi;
  onBack: () => void;
}

export function NetworkPage({ api, onBack }: Props) {
  const [snapshot, setSnapshot] = useState<NetworkSnapshot>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setSnapshot(await api.network()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load network state.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [api]);
  const gateway = snapshot?.gateway;
  const tunnel = snapshot?.tunnel;
  const routes = snapshot?.publishedServices ?? [];

  return (
    <Stack gap="xl" pb={36}>
      <PageHeader
        eyebrow="Exposure control"
        title="Network & routes"
        copy="Review exactly what MJT accepts locally and what is intentionally published through Cloudflare. Nothing here opens a random host port."
        actions={<Group><Button variant="subtle" leftSection={<IconArrowLeft size={15} />} onClick={onBack}>Workspaces</Button><Button variant="default" loading={loading} leftSection={<IconRefresh size={16} />} onClick={() => void load()}>Refresh</Button></Group>}
      />
      {error && <Alert color="red">{error}</Alert>}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <StatusCard
          icon={<IconNetwork size={21} />}
          title="Gateway listener"
          state={gateway?.enabled ? 'Enabled' : 'Disabled'}
          color={gateway?.enabled ? 'teal' : 'gray'}
          rows={[['Public listener', gateway ? `${gateway.host}:${gateway.port}` : 'Not reported'], ['Purpose', 'One approved inbound endpoint']]} 
        />
        <StatusCard
          icon={<IconCloud size={21} />}
          title="Cloudflare Tunnel"
          state={tunnel?.running ? 'Running' : tunnel?.enabled ? 'Configured' : 'Disabled'}
          color={tunnel?.running ? 'teal' : tunnel?.enabled ? 'orange' : 'gray'}
          rows={[['Mode', tunnel?.mode || 'Not reported'], ['Current state', tunnel?.running ? 'Ready to route HTTP traffic' : 'Not currently running']]} 
        />
      </SimpleGrid>

      <Card className="mjt-network-card" padding="lg">
        <Group gap="sm" mb="md"><ThemeIcon radius="xl" variant="light" color="indigo"><IconLock size={17} /></ThemeIcon><div><Text fw={730}>How exposure works</Text><Text size="sm" className="mjt-subtle">Services bind to loopback first. A hostname appears only after a deliberate Publish action.</Text></div></Group>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <RouteStep number="01" title="Private service" copy="Your app listens on 127.0.0.1 inside the managed workspace." />
          <RouteStep number="02" title="Health check" copy="MJT checks the local origin before you share it." />
          <RouteStep number="03" title="Published hostname" copy="Cloudflare Tunnel is the explicit public edge." />
        </SimpleGrid>
      </Card>

      <section>
        <Group justify="space-between" mb="md"><div><Text className="mjt-section-title">Published routes</Text><Text size="sm" className="mjt-subtle" mt={4}>These are the only guest applications currently exposed via a public hostname.</Text></div><Badge variant="light" color={routes.length ? 'violet' : 'gray'}>{routes.length} route{routes.length === 1 ? '' : 's'}</Badge></Group>
        {routes.length ? (
          <Stack gap="sm">
            {routes.map((route) => (
              <Card key={route.serviceId} className="mjt-network-card" padding="md">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="sm"><ThemeIcon variant="light" radius="xl" color="violet"><IconRoute size={17} /></ThemeIcon><div><Text fw={700}>{route.serviceId}</Text><Text size="xs" className="mjt-subtle">Cloudflare hostname → local loopback origin</Text></div></Group>
                  <Group gap="sm" wrap="wrap"><Code>{route.hostname}</Code><Text className="mjt-subtle">→</Text><Code>{route.origin}</Code></Group>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <div className="mjt-empty-state"><Stack align="center" gap="sm"><ThemeIcon size={48} radius="xl" variant="light" color="gray"><IconWorld size={22} /></ThemeIcon><Text fw={700}>No public routes</Text><Text size="sm" className="mjt-subtle" maw={440}>Everything is private right now. Go to Services when you are ready to publish a healthy application through Cloudflare.</Text></Stack></div>
        )}
      </section>
    </Stack>
  );
}

function StatusCard({ icon, title, state, color, rows }: { icon: ReactNode; title: string; state: string; color: string; rows: Array<[string, string]> }) {
  return <Card className="mjt-network-card" padding="lg"><Group justify="space-between" align="flex-start"><ThemeIcon size={42} radius="xl" variant="light" color={color}>{icon}</ThemeIcon><Badge color={color} variant="light">{state}</Badge></Group><Text fw={730} mt="lg">{title}</Text><Stack gap={7} mt="md">{rows.map(([label, value]) => <Group key={label} justify="space-between" gap="lg"><Text size="sm" className="mjt-subtle">{label}</Text><Text size="sm" ta="right">{value}</Text></Group>)}</Stack></Card>;
}

function RouteStep({ number, title, copy }: { number: string; title: string; copy: string }) {
  return <div><Text size="xs" c="indigo.3" fw={800}>{number}</Text><Text fw={700} mt={4}>{title}</Text><Text size="sm" className="mjt-subtle" mt={4}>{copy}</Text></div>;
}
