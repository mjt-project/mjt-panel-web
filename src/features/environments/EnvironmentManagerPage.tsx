import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBox,
  IconCheck,
  IconCpu,
  IconDownload,
  IconPlayerPlay,
  IconRefresh,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react';
import {
  type DistroCatalogEntry,
  type DistroCatalogSnapshot,
  type DistroEngineInfo,
  type DistroEnvironment,
  type DistroJob,
  PanelControlApi,
} from '../../api/control-v1';
import { PageHeader } from '../../ui/ControlFrame';

interface Props {
  api: PanelControlApi;
  onBack: () => void;
}

const TERMINAL_JOB_STATES = new Set(['succeeded', 'failed']);

export function EnvironmentManagerPage({ api, onBack }: Props) {
  const [catalog, setCatalog] = useState<DistroCatalogSnapshot>();
  const [engine, setEngine] = useState<DistroEngineInfo>();
  const [environments, setEnvironments] = useState<DistroEnvironment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<DistroJob>();
  const [createFor, setCreateFor] = useState<DistroCatalogEntry>();
  const [environmentName, setEnvironmentName] = useState('');
  const [removeTarget, setRemoveTarget] = useState<DistroEnvironment>();

  const active = useMemo(() => environments.find((environment) => environment.active), [environments]);

  const load = async (showBusy = true) => {
    if (showBusy) setLoading(true);
    setError('');
    try {
      const [nextCatalog, nextEngine, nextEnvironments] = await Promise.all([
        api.distroCatalog(),
        api.distroEngine(),
        api.listDistros(),
      ]);
      setCatalog(nextCatalog);
      setEngine(nextEngine.engine);
      setEnvironments(nextEnvironments.environments);
    } catch (reason) {
      setError(readError(reason, 'Could not load the MJT environment runtime.'));
    } finally {
      if (showBusy) setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [api]);

  useEffect(() => {
    if (!job || TERMINAL_JOB_STATES.has(job.state)) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const snapshot = await api.distroJob(job.id);
        if (cancelled) return;
        setJob(snapshot.job);
        if (TERMINAL_JOB_STATES.has(snapshot.job.state)) {
          await load(false);
          if (snapshot.job.state === 'succeeded') {
            notifications.show({ color: 'teal', title: 'Environment task completed', message: taskMessage(snapshot.job) });
          }
        }
      } catch (reason) {
        if (!cancelled) setError(readError(reason, 'Could not read environment task progress.'));
      }
    }, 1100);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [api, job]);

  const beginEngineInstall = async () => {
    setActionBusy(true); setError('');
    try {
      const accepted = await api.installDistroEngine();
      setJob({ id: accepted.jobId, type: 'engine-install', target: 'proot-distro', state: 'queued', message: 'Queued', createdAt: '', startedAt: '', finishedAt: '', logs: [] });
    } catch (reason) {
      setError(readError(reason, 'Could not prepare the environment engine.'));
    } finally { setActionBusy(false); }
  };

  const beginEnvironmentInstall = async () => {
    if (!createFor) return;
    setActionBusy(true); setError('');
    try {
      const accepted = await api.installDistro({
        catalogId: createFor.id,
        name: environmentName.trim(),
        activate: true,
      });
      setCreateFor(undefined);
      setEnvironmentName('');
      setJob({ id: accepted.jobId, type: 'environment-install', target: createFor.label, state: 'queued', message: 'Queued', createdAt: '', startedAt: '', finishedAt: '', logs: [] });
    } catch (reason) {
      setError(readError(reason, 'Could not create the environment.'));
    } finally { setActionBusy(false); }
  };

  const activate = async (environment: DistroEnvironment) => {
    setActionBusy(true); setError('');
    try {
      const accepted = await api.activateDistro(environment.name);
      setJob({ id: accepted.jobId, type: 'environment-activate', target: environment.name, state: 'queued', message: 'Queued', createdAt: '', startedAt: '', finishedAt: '', logs: [] });
    } catch (reason) {
      setError(readError(reason, `Could not activate ${environment.name}.`));
    } finally { setActionBusy(false); }
  };

  const remove = async () => {
    if (!removeTarget) return;
    setActionBusy(true); setError('');
    try {
      const accepted = await api.removeDistro(removeTarget.name);
      setJob({ id: accepted.jobId, type: 'environment-remove', target: removeTarget.name, state: 'queued', message: 'Queued', createdAt: '', startedAt: '', finishedAt: '', logs: [] });
      setRemoveTarget(undefined);
    } catch (reason) {
      setError(readError(reason, `Could not remove ${removeTarget.name}.`));
    } finally { setActionBusy(false); }
  };

  const canBootstrap = Boolean(engine?.enabled && engine?.linuxHost && engine?.architectureSupported && engine?.prootReady && engine?.pythonReady);
  const noNativeArchitecture = catalog && !catalog.supported;

  return (
    <Stack gap="xl" pb={36}>
      <PageHeader
        eyebrow="Guest runtime"
        title="Linux environments"
        copy="Prepare one native Linux environment first. MJT keeps project files in the workspace and runs package tools inside the selected environment."
        actions={<Group><Button variant="subtle" leftSection={<IconArrowLeft size={15} />} onClick={onBack}>Workspaces</Button><Button variant="default" loading={loading} leftSection={<IconRefresh size={16} />} onClick={() => void load()}>Refresh</Button></Group>}
      />

      {error && <Alert color="red" title="Environment action failed">{error}</Alert>}
      {noNativeArchitecture && <Alert color="red" icon={<IconAlertTriangle size={17} />} title="Unsupported host architecture">MJT supports only native x86_64/amd64 and aarch64/arm64 environments. Cross-architecture emulation is intentionally unavailable.</Alert>}

      <Card className="mjt-environment-card" padding="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Group gap="sm">
            <ThemeIcon size={42} radius="xl" variant="light" color={engine?.ready ? 'teal' : 'indigo'}><IconCpu size={21} /></ThemeIcon>
            <div>
              <Text fw={760}>Environment engine</Text>
              <Text size="sm" className="mjt-subtle">MJT installs and manages a pinned upstream PRoot-Distro engine in its own directory.</Text>
            </div>
          </Group>
          <Badge color={engine?.ready ? 'teal' : 'orange'} variant="light">{engine?.ready ? `Ready${engine?.version ? ` · ${engine.version}` : ''}` : 'Setup required'}</Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm" mt="lg">
          <Requirement label="Linux host" ready={Boolean(engine?.linuxHost)} detail={engine?.linuxHost ? 'Detected' : 'Required'} />
          <Requirement label="Native CPU" ready={Boolean(engine?.architectureSupported)} detail={engine?.displayArchitecture || 'Checking'} />
          <Requirement label="PRoot" ready={Boolean(engine?.prootReady)} detail={engine?.prootReady ? 'Ready' : 'Not ready'} />
          <Requirement label="Python 3.9+" ready={Boolean(engine?.pythonReady)} detail={engine?.pythonReady ? 'Ready' : 'Not found'} />
        </SimpleGrid>

        {!engine?.ready && (
          <Alert mt="lg" color={canBootstrap ? 'indigo' : 'orange'} title={canBootstrap ? 'Ready to bootstrap' : 'Host prerequisite missing'}>
            {canBootstrap
              ? 'The first setup creates an isolated MJT Python environment and installs the pinned Distro engine. Existing host packages are not changed.'
              : 'MJT needs a Linux host, native PRoot and Python 3.9+ before it can prepare environments.'}
          </Alert>
        )}
        <Group justify="flex-end" mt="lg">
          {!engine?.ready && <Button leftSection={<IconDownload size={16} />} loading={actionBusy} disabled={!canBootstrap} onClick={() => void beginEngineInstall()}>Prepare environment engine</Button>}
        </Group>
      </Card>

      {active && (
        <Alert color="teal" title="Active environment">
          <Group justify="space-between" wrap="wrap"><span><strong>{active.name}</strong> is the guest runtime currently used by MJT.</span><Code>{active.architecture}</Code></Group>
        </Alert>
      )}

      <section>
        <Group justify="space-between" align="end" mb="md">
          <div>
            <Text className="mjt-section-title">Recommended environments</Text>
            <Text size="sm" className="mjt-subtle" mt={4}>Only images matching the host CPU appear here. MJT does not offer emulation or arbitrary images.</Text>
          </div>
          {catalog && <Badge variant="light" color="indigo">Host architecture: {catalog.hostArchitecture}</Badge>}
        </Group>
        {engine?.ready && catalog?.environments.length ? (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {catalog.environments.map((entry) => <CatalogCard key={entry.id} entry={entry} busy={actionBusy} onInstall={() => { setCreateFor(entry); setEnvironmentName(''); }} />)}
          </SimpleGrid>
        ) : (
          <div className="mjt-empty-state"><Stack align="center" gap="sm"><ThemeIcon size={48} radius="xl" variant="light" color="indigo"><IconBox size={22} /></ThemeIcon><Text fw={700}>Prepare the environment engine first</Text><Text size="sm" className="mjt-subtle" maw={460}>Once the engine is ready, Debian 12, Ubuntu 24.04 and Alpine 3.21 will be available for this host architecture.</Text></Stack></div>
        )}
      </section>

      <section>
        <Group justify="space-between" align="end" mb="md">
          <div><Text className="mjt-section-title">Installed environments</Text><Text size="sm" className="mjt-subtle" mt={4}>Only one environment is active at a time. Services use the active environment through PRoot.</Text></div>
          <Badge variant="light" color={environments.length ? 'violet' : 'gray'}>{environments.length} installed</Badge>
        </Group>
        {environments.length ? <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">{environments.map((environment) => <EnvironmentCard key={environment.name} environment={environment} busy={actionBusy} onActivate={activate} onRemove={setRemoveTarget} />)}</SimpleGrid> : <div className="mjt-empty-state"><Stack align="center" gap="sm"><ThemeIcon size={48} radius="xl" variant="light" color="gray"><IconTerminal2 size={22} /></ThemeIcon><Text fw={700}>No Linux environment installed</Text><Text size="sm" className="mjt-subtle" maw={460}>Pick one recommendation above. MJT will download the rootfs, prepare it, and activate it when the task finishes.</Text></Stack></div>}
      </section>

      <Modal opened={Boolean(createFor)} onClose={() => !actionBusy && setCreateFor(undefined)} title={`Install ${createFor?.label || 'environment'}`} centered>
        <Stack>
          <Alert color="indigo" title="Native environment only">{createFor && <>{createFor.image} · {createFor.architecture} · uses <Code>{createFor.packageManager}</Code> inside the guest.</>}</Alert>
          <TextInput label="Environment name" placeholder={createFor?.id} value={environmentName} onChange={(event) => setEnvironmentName(event.currentTarget.value.toLowerCase())} description="Optional. Leave blank to use the recommended name. Use lowercase letters, digits, dot, underscore or hyphen." />
          <Text size="sm" className="mjt-subtle">It will become active when installation completes. Project files remain outside the rootfs under the MJT workspace.</Text>
          <Group justify="flex-end"><Button variant="default" disabled={actionBusy} onClick={() => setCreateFor(undefined)}>Cancel</Button><Button leftSection={<IconDownload size={16} />} loading={actionBusy} onClick={() => void beginEnvironmentInstall()}>Install & activate</Button></Group>
        </Stack>
      </Modal>

      <Modal opened={Boolean(removeTarget)} onClose={() => !actionBusy && setRemoveTarget(undefined)} title="Remove environment" centered>
        <Stack>
          <Alert color="red" title="This cannot be undone">Remove <strong>{removeTarget?.name}</strong> and its root filesystem? Workspace files are outside the rootfs and are not deleted.</Alert>
          <Group justify="flex-end"><Button variant="default" disabled={actionBusy} onClick={() => setRemoveTarget(undefined)}>Cancel</Button><Button color="red" leftSection={<IconTrash size={16} />} loading={actionBusy} onClick={() => void remove()}>Remove environment</Button></Group>
        </Stack>
      </Modal>

      <Modal opened={Boolean(job)} onClose={() => setJob(undefined)} title="Environment task" size="lg" centered>
        {job && <Stack>
          <Group justify="space-between" wrap="wrap"><div><Text fw={720}>{taskTitle(job)}</Text><Text size="sm" className="mjt-subtle">{job.target || 'MJT environment runtime'}</Text></div><Badge color={jobColor(job.state)} variant="light">{job.state}</Badge></Group>
          <Alert color={job.state === 'failed' ? 'red' : job.state === 'succeeded' ? 'teal' : 'indigo'}>{job.message || 'Working…'}</Alert>
          <Divider />
          <Text size="sm" fw={700}>Task output</Text>
          <pre className="mjt-console">{job.logs.length ? job.logs.join('\n') : 'Waiting for Core to start this task…'}</pre>
          {TERMINAL_JOB_STATES.has(job.state) && <Group justify="flex-end"><Button onClick={() => setJob(undefined)}>Close</Button></Group>}
        </Stack>}
      </Modal>
    </Stack>
  );
}

function Requirement({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return <Card className="mjt-environment-requirement" padding="md"><Group justify="space-between" align="flex-start"><Text size="sm" fw={700}>{label}</Text><ThemeIcon size={23} radius="xl" variant="light" color={ready ? 'teal' : 'orange'}>{ready ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />}</ThemeIcon></Group><Text size="xs" className="mjt-subtle" mt={8}>{detail}</Text></Card>;
}

function CatalogCard({ entry, busy, onInstall }: { entry: DistroCatalogEntry; busy: boolean; onInstall: () => void }) {
  const iconTone = entry.id.startsWith('ubuntu') ? 'orange' : entry.id.startsWith('alpine') ? 'cyan' : 'indigo';
  return <Card className="mjt-environment-card" padding="lg"><Group justify="space-between" align="flex-start"><ThemeIcon size={42} radius="xl" variant="light" color={iconTone}><IconBox size={20} /></ThemeIcon><Badge variant="outline" color="gray">{entry.architecture}</Badge></Group><Text fw={750} mt="lg">{entry.label}</Text><Text size="sm" className="mjt-subtle" mt={4}>{entry.image}</Text><Group gap={7} mt="md"><Badge variant="light" color="violet">Native</Badge><Badge variant="light" color="gray">{entry.packageManager}</Badge></Group><Button fullWidth mt="lg" leftSection={<IconDownload size={16} />} loading={busy} onClick={onInstall}>Install & activate</Button></Card>;
}

function EnvironmentCard({ environment, busy, onActivate, onRemove }: { environment: DistroEnvironment; busy: boolean; onActivate: (environment: DistroEnvironment) => void; onRemove: (environment: DistroEnvironment) => void }) {
  return <Card className="mjt-environment-card" padding="lg"><Group justify="space-between" align="flex-start"><Group gap="sm"><ThemeIcon size={42} radius="xl" variant="light" color={environment.active ? 'teal' : 'gray'}><IconTerminal2 size={20} /></ThemeIcon><div><Text fw={750}>{environment.name}</Text><Text size="xs" className="mjt-subtle">{environment.source || 'Managed environment'}</Text></div></Group><Badge color={environment.active ? 'teal' : environment.ready ? 'gray' : 'orange'} variant="light">{environment.active ? 'Active' : environment.ready ? 'Ready' : 'Incomplete'}</Badge></Group><Group gap={7} mt="lg"><Badge variant="outline" color="gray">{environment.architecture}</Badge><Badge variant="outline" color={environment.ready ? 'teal' : 'orange'}>{environment.ready ? 'Rootfs ready' : 'Needs repair'}</Badge></Group><Text size="xs" className="mjt-subtle" mt="md" lineClamp={1}>{environment.rootfs}</Text><Divider my="md" /><Group justify="space-between"><Button size="compact-sm" variant="light" leftSection={<IconPlayerPlay size={14} />} loading={busy} disabled={environment.active || !environment.ready} onClick={() => void onActivate(environment)}>Use this environment</Button><Button size="compact-sm" variant="subtle" color="red" leftSection={<IconTrash size={14} />} loading={busy} disabled={environment.active} onClick={() => onRemove(environment)}>Remove</Button></Group></Card>;
}

function readError(reason: unknown, fallback: string): string {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}

function jobColor(state: string): string {
  if (state === 'succeeded') return 'teal';
  if (state === 'failed') return 'red';
  if (state === 'queued') return 'orange';
  return 'indigo';
}

function taskTitle(job: DistroJob): string {
  if (job.type === 'engine-install') return 'Preparing environment engine';
  if (job.type === 'environment-install') return 'Installing Linux environment';
  if (job.type === 'environment-activate') return 'Activating environment';
  if (job.type === 'environment-remove') return 'Removing environment';
  return 'MJT environment task';
}

function taskMessage(job: DistroJob): string {
  if (job.type === 'environment-install') return `${job.target || 'Environment'} is ready to use.`;
  if (job.type === 'engine-install') return 'The Environment engine is ready.';
  return job.message || 'Completed.';
}
