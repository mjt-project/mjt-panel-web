import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon, Alert, Badge, Button, Card, Code, Divider, Drawer, Group,
  Modal, Select, SimpleGrid, Stack, Switch, Text, TextInput, Textarea,
  ThemeIcon, Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconActivityHeartbeat, IconArrowLeft, IconCloudUpload,
  IconFileText, IconPlayerPlay, IconPlayerStop, IconPlus,
  IconRefresh, IconRotate, IconSettings, IconTerminal2, IconTrash,
} from '@tabler/icons-react';
import { PageHeader } from '../../ui/ControlFrame';
import {
  type CreateGuestServiceInput, type GuestService, PanelControlApi,
} from '../../api/control-v1';

interface Props {
  api: PanelControlApi;
  apiBase: string;
  onApiBaseChange: (apiBase: string) => void;
  onBack: () => void;
}

const emptyForm: CreateGuestServiceInput = {
  id: '', type: 'node', workdir: '/home/container/server/', command: '', port: 0,
  restartPolicy: 'never', healthEnabled: false, healthPath: '/', publicHostname: '', autostart: false,
};

export function ServiceManagerPage({ api, apiBase, onApiBaseChange, onBack }: Props) {
  const [services, setServices] = useState<GuestService[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [apiDraft, setApiDraft] = useState(apiBase);
  const [form, setForm] = useState<CreateGuestServiceInput>(emptyForm);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<GuestService>();
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.listServices();
      setServices(response.services ?? []);
      setError('');
      setSelected((current) => current ? (response.services ?? []).find((service) => service.id === current.id) : undefined);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Could not load services.';
      setError(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [api]);
  useEffect(() => { setApiDraft(apiBase); }, [apiBase]);

  const counts = useMemo(() => ({
    running: services.filter((service) => service.running).length,
    unhealthy: services.filter((service) => service.health.enabled && !['healthy', 'disabled', 'off'].includes(service.health.status)).length,
    public: services.filter((service) => service.public.enabled).length,
  }), [services]);

  const action = async (service: GuestService, name: 'start' | 'stop' | 'restart' | 'publish' | 'unpublish' | 'health') => {
    setLoading(true);
    try {
      await api.serviceAction(service.id, name);
      await load();
      notifications.show({ color: 'teal', title: `${service.id}: ${labelAction(name)}`, message: 'MJT Core completed the request.' });
    } catch (reason) {
      notifications.show({ color: 'red', title: 'Service action failed', message: reason instanceof Error ? reason.message : 'Unknown error' });
    } finally { setLoading(false); }
  };

  const remove = async (service: GuestService) => {
    if (!window.confirm(`Remove service '${service.id}'? Workspace files will not be deleted.`)) return;
    setLoading(true);
    try {
      await api.deleteService(service.id);
      if (selected?.id === service.id) setSelected(undefined);
      await load();
      notifications.show({ color: 'teal', title: 'Service removed', message: `${service.id} was removed. Its files stay in the workspace.` });
    } catch (reason) {
      notifications.show({ color: 'red', title: 'Remove failed', message: reason instanceof Error ? reason.message : 'Unknown error' });
    } finally { setLoading(false); }
  };

  const create = async () => {
    setError('');
    setLoading(true);
    try {
      await api.createService(form);
      setCreateOpen(false);
      setForm(emptyForm);
      await load();
      notifications.show({ color: 'teal', title: 'Service saved', message: 'It will not run until you explicitly start it.' });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add service.');
    } finally { setLoading(false); }
  };

  const openLogs = async (service: GuestService) => {
    setSelected(service);
    setLogs([]);
    setLogsLoading(true);
    try {
      const response = await api.serviceLogs(service.id, 400);
      setLogs(response.lines ?? []);
    } catch (reason) {
      setLogs([reason instanceof Error ? reason.message : 'Could not load service logs.']);
    } finally { setLogsLoading(false); }
  };

  return (
    <Stack gap="xl" pb={36}>
      <PageHeader
        eyebrow="PRoot workloads"
        title="Applications"
        copy="Every app here runs inside the guest runtime. Ports remain loopback-only until you explicitly publish a Cloudflare route."
        actions={<Group><Button variant="subtle" leftSection={<IconArrowLeft size={15} />} onClick={onBack}>Workspaces</Button><Button variant="default" leftSection={<IconRefresh size={16} />} loading={loading} onClick={() => void load()}>Refresh</Button><Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>New service</Button></Group>}
      />

      {error && <Alert color="red">{error}</Alert>}
      <Alert color="indigo" variant="light" title="Safe by default">
        MJT blocks direct host exposure. A public hostname is only created after you use Publish for a service that is already bound to loopback.
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Summary label="Running" value={counts.running} detail={`${services.length} registered services`} color="teal" />
        <Summary label="Health attention" value={counts.unhealthy} detail={counts.unhealthy ? 'Review health checks before sharing a route' : 'No unhealthy checks reported'} color="orange" />
        <Summary label="Published" value={counts.public} detail="Cloudflare routes currently enabled" color="violet" />
      </SimpleGrid>

      <Group justify="space-between" align="end">
        <div>
          <Text className="mjt-section-title">Service inventory</Text>
          <Text size="sm" className="mjt-subtle" mt={4}>Open a card for the command, health state and latest service output.</Text>
        </div>
        <Button variant="subtle" size="compact-md" leftSection={<IconSettings size={15} />} onClick={() => setApiSettingsOpen(true)}>Control API endpoint</Button>
      </Group>

      {services.length ? (
        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              busy={loading}
              onAction={action}
              onLogs={() => void openLogs(service)}
              onRemove={() => void remove(service)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <div className="mjt-empty-state">
          <Stack align="center" gap="sm">
            <ThemeIcon size={50} radius="xl" variant="light" color="indigo"><IconTerminal2 size={23} /></ThemeIcon>
            <Text fw={720}>No guest services yet</Text>
            <Text size="sm" className="mjt-subtle" maw={430}>Add Node, Java, Python or OpenVSCode with a workspace folder and a start command.</Text>
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>Create first service</Button>
          </Stack>
        </div>
      )}

      <Drawer opened={Boolean(selected)} onClose={() => setSelected(undefined)} title={selected ? `${selected.id} · service details` : 'Service details'} position="right" size="md">
        {selected && (
          <Stack gap="lg">
            <Group justify="space-between"><Badge variant="light" color={selected.running ? 'teal' : 'gray'}>{selected.running ? 'Running' : 'Stopped'}</Badge><Badge variant="light" color={healthColor(selected.health.status)}>{selected.health.status}</Badge></Group>
            <Detail label="Runtime" value={`${selected.type} / ${selected.runtime}`} />
            <Detail label="Local origin" value={`${selected.host}:${selected.port || '—'}`} mono />
            <Detail label="Workspace" value={selected.workdir} mono />
            <Detail label="Restart policy" value={`${selected.lifecycle.restartPolicy} · max ${selected.lifecycle.restartMax}`} />
            {selected.public.enabled && <Detail label="Public hostname" value={selected.public.hostname} />}
            <Divider />
            <Group justify="space-between"><Text fw={700}>Latest output</Text><Button size="compact-sm" variant="subtle" loading={logsLoading} onClick={() => void openLogs(selected)}>Reload</Button></Group>
            <pre className="mjt-console">{logsLoading ? 'Loading logs…' : logs.join('\n') || 'No output is stored yet.'}</pre>
          </Stack>
        )}
      </Drawer>

      <Modal opened={apiSettingsOpen} onClose={() => setApiSettingsOpen(false)} title="Core control API" size="lg">
        <Stack>
          <Text size="sm" className="mjt-subtle">For a panel published through Cloudflare, set the hostname routed to the loopback-only Core API, such as <Code>https://api.example.com/api/v1</Code>.</Text>
          <TextInput label="Control API base URL" value={apiDraft} onChange={(event) => setApiDraft(event.currentTarget.value)} placeholder="http://127.0.0.1:9091/api/v1" />
          <Group justify="flex-end"><Button variant="default" onClick={() => setApiSettingsOpen(false)}>Cancel</Button><Button onClick={() => { onApiBaseChange(apiDraft); setApiSettingsOpen(false); }}>Save endpoint</Button></Group>
        </Stack>
      </Modal>

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Create guest service" size="lg">
        <Stack>
          <Text size="sm" className="mjt-subtle">The workspace path must stay below <Code>/home/container/server</Code>. The command runs inside PRoot, not on the host shell.</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Service ID" placeholder="api" value={form.id} onChange={(event) => setForm({ ...form, id: event.currentTarget.value })} required />
            <Select label="Runtime template" data={['node', 'java', 'python', 'openvscode', 'custom']} value={form.type} onChange={(value) => setForm({ ...form, type: value || 'custom' })} />
          </SimpleGrid>
          <TextInput label="Host workspace" value={form.workdir} onChange={(event) => setForm({ ...form, workdir: event.currentTarget.value })} required />
          <Textarea label="Command inside PRoot" minRows={3} placeholder="npm run start" value={form.command} onChange={(event) => setForm({ ...form, command: event.currentTarget.value })} required />
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Loopback port" type="number" value={String(form.port || '')} onChange={(event) => setForm({ ...form, port: Number(event.currentTarget.value || 0) })} />
            <Select label="Restart policy" data={['never', 'on-failure', 'always']} value={form.restartPolicy || 'never'} onChange={(value) => setForm({ ...form, restartPolicy: (value || 'never') as CreateGuestServiceInput['restartPolicy'] })} />
          </SimpleGrid>
          <TextInput label="Public hostname (optional)" placeholder="api.example.com" value={form.publicHostname || ''} onChange={(event) => setForm({ ...form, publicHostname: event.currentTarget.value })} description="A route is created only when you press Publish after saving." />
          <Group justify="space-between"><Switch label="Enable health check" checked={Boolean(form.healthEnabled)} onChange={(event) => setForm({ ...form, healthEnabled: event.currentTarget.checked })} /><Switch label="Autostart after Core boot" checked={Boolean(form.autostart)} onChange={(event) => setForm({ ...form, autostart: event.currentTarget.checked })} /></Group>
          {form.healthEnabled && <TextInput label="Health path" value={form.healthPath || '/'} onChange={(event) => setForm({ ...form, healthPath: event.currentTarget.value })} />}
          {error && <Alert color="red">{error}</Alert>}
          <Group justify="flex-end"><Button variant="default" onClick={() => setCreateOpen(false)}>Cancel</Button><Button loading={loading} onClick={() => void create()}>Save service</Button></Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function ServiceCard({ service, busy, onAction, onLogs, onRemove }: {
  service: GuestService;
  busy: boolean;
  onAction: (service: GuestService, action: 'start' | 'stop' | 'restart' | 'publish' | 'unpublish' | 'health') => Promise<void>;
  onLogs: () => void;
  onRemove: () => void;
}) {
  const running = service.running;
  const health = service.health.status;
  return (
    <Card className="mjt-service-card" padding="lg">
      <Group justify="space-between" align="flex-start">
        <Group gap="sm">
          <ThemeIcon size={42} radius="xl" variant="light" color={running ? 'teal' : 'gray'}><IconTerminal2 size={20} /></ThemeIcon>
          <div><Text fw={760}>{service.id}</Text><Text size="xs" className="mjt-subtle">{service.type} · {service.runtime}</Text></div>
        </Group>
        <Badge color={running ? 'teal' : 'gray'} variant="light">{running ? 'Running' : 'Stopped'}</Badge>
      </Group>

      <Group gap={7} mt="lg" wrap="wrap">
        <Badge variant="outline" color={healthColor(health)} leftSection={<IconActivityHeartbeat size={12} />}>{health}</Badge>
        <Badge variant="outline" color={service.public.enabled ? 'violet' : 'gray'}>{service.public.enabled ? 'Published' : 'Private'}</Badge>
      </Group>

      <Text size="sm" className="mjt-subtle" mt="lg" lineClamp={2}>{service.command || 'No start command saved.'}</Text>
      <Text size="xs" className="mjt-subtle" mt={10}>Origin <Code>{service.host}:{service.port || '—'}</Code></Text>
      <Text size="xs" className="mjt-subtle" mt={4} lineClamp={1}>{service.workdir}</Text>

      <Divider my="md" />
      <Group justify="space-between" wrap="nowrap">
        <Group gap={5} wrap="nowrap">
          {running ? (
            <Tooltip label="Stop service"><ActionIcon variant="light" color="gray" aria-label="Stop service" loading={busy} onClick={() => void onAction(service, 'stop')}><IconPlayerStop size={17} /></ActionIcon></Tooltip>
          ) : (
            <Tooltip label="Start service"><ActionIcon variant="filled" aria-label="Start service" loading={busy} onClick={() => void onAction(service, 'start')}><IconPlayerPlay size={17} /></ActionIcon></Tooltip>
          )}
          <Tooltip label="Restart service"><ActionIcon variant="subtle" color="indigo" aria-label="Restart service" loading={busy} onClick={() => void onAction(service, 'restart')}><IconRotate size={17} /></ActionIcon></Tooltip>
          <Tooltip label="Run health check"><ActionIcon variant="subtle" color="teal" aria-label="Run health check" loading={busy} onClick={() => void onAction(service, 'health')}><IconActivityHeartbeat size={17} /></ActionIcon></Tooltip>
          <Tooltip label="View logs"><ActionIcon variant="subtle" aria-label="View logs" onClick={onLogs}><IconFileText size={17} /></ActionIcon></Tooltip>
        </Group>
        <Group gap={4} wrap="nowrap">
          <Tooltip label={service.public.enabled ? 'Remove public route' : 'Publish through Cloudflare'}><ActionIcon variant="subtle" color={service.public.enabled ? 'gray' : 'violet'} aria-label="Change public route" loading={busy} onClick={() => void onAction(service, service.public.enabled ? 'unpublish' : 'publish')}><IconCloudUpload size={17} /></ActionIcon></Tooltip>
          <Tooltip label="Remove service"><ActionIcon variant="subtle" color="red" aria-label="Remove service" loading={busy} onClick={onRemove}><IconTrash size={17} /></ActionIcon></Tooltip>
        </Group>
      </Group>
    </Card>
  );
}

function Summary({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  return <Card className="mjt-metric-card" padding="lg"><Badge color={color} variant="light">{label}</Badge><div className="mjt-metric-value">{value}</div><Text size="sm" className="mjt-subtle">{detail}</Text></Card>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><Text size="xs" className="mjt-subtle" tt="uppercase" fw={700}>{label}</Text>{mono ? <Code mt={4} style={{ display: 'inline-block', maxWidth: '100%', overflowWrap: 'anywhere' }}>{value}</Code> : <Text size="sm" mt={3}>{value}</Text>}</div>;
}

function healthColor(status: string): string {
  if (status === 'healthy') return 'teal';
  if (status === 'disabled' || status === 'off') return 'gray';
  if (status === 'unhealthy' || status === 'failed') return 'red';
  return 'orange';
}

function labelAction(action: string): string {
  return action.slice(0, 1).toUpperCase() + action.slice(1);
}
