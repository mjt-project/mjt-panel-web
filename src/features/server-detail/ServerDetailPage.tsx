import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Alert, Badge, Box, Breadcrumbs, Button, Card, Group, Menu, Modal, Paper, SimpleGrid, Stack, Tabs, Text, TextInput, Textarea, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconArrowLeft, IconCloud, IconDeviceFloppy, IconDotsVertical, IconFile, IconFilePlus, IconFolder, IconFolderOpen, IconPlayerPlay, IconPlayerStop, IconRefresh, IconRocket, IconSettings, IconTerminal2, IconTrash, IconWorld } from '@tabler/icons-react';
import type { ApiClient } from '../../api/client';
import type { Capabilities, FileEntry, ServerProfile } from '../../api/types';

interface Props { server: ServerProfile; api: ApiClient; capabilities: Capabilities; onBack: () => void; onChanged: () => Promise<void>; }

function relativeParent(path: string) {
  if (!path) return '';
  const values = path.split('/').filter(Boolean); values.pop(); return values.join('/');
}

function prettySize(size?: number | string) {
  const bytes = typeof size === 'string' ? Number.parseFloat(size) : size;

  if (bytes == null || !Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ServerDetailPage({ server, api, capabilities, onBack, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [confirmKill, setConfirmKill] = useState(false);
  const [path, setPath] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [openedFile, setOpenedFile] = useState('');
  const [content, setContent] = useState('');
  const [fileError, setFileError] = useState('');

  const statusColor = server.running ? 'teal' : 'gray';
  const breadcrumb = useMemo(() => [{ title: 'Servers', onClick: onBack }, { title: server.name }], [server.name, onBack]);

  const refreshLogs = async () => { try { const response = await api.logs(server.name); setLogs(response.lines ?? []); } catch { setLogs(['Unable to load console logs.']); } };
  useEffect(() => { if (activeTab === 'console') void refreshLogs(); }, [activeTab]);

  const action = async (name: 'start' | 'stop' | 'restart' | 'kill') => {
    setBusy(true);
    try { await api.action(name, server.name); await onChanged(); } finally { setBusy(false); setConfirmKill(false); }
  };

  const sendCommand = async () => {
    if (!command.trim()) return;
    setBusy(true);
    try { await api.sendCommand(server.name, command.trim()); setCommand(''); await refreshLogs(); } finally { setBusy(false); }
  };

  const loadFiles = async (nextPath = path) => {
    if (!capabilities.files) return;
    setFileLoading(true); setFileError('');
    try { const result = await api.listFiles(server.name, nextPath); setFiles(result.entries ?? []); setPath(nextPath); } catch (error) { setFileError(error instanceof Error ? error.message : 'Could not load files.'); } finally { setFileLoading(false); }
  };

  const openFile = async (entry: FileEntry) => {
    if (entry.directory) return loadFiles(entry.path);
    setFileLoading(true); setFileError('');
    try { const result = await api.readFile(server.name, entry.path); setOpenedFile(entry.path); setContent(result.content ?? ''); } catch (error) { setFileError(error instanceof Error ? error.message : 'Could not read file.'); } finally { setFileLoading(false); }
  };

  const saveFile = async () => { if (!openedFile) return; setBusy(true); try { await api.writeFile(server.name, openedFile, content); } finally { setBusy(false); } };

  return (
    <Box className="mjt-page-shell">
      <Box maw={1180} mx="auto" px="md" py={24}>
        <Group justify="space-between" mb={28}>
          <Stack gap={8}>
            <Breadcrumbs separator="/">{breadcrumb.map((item) => item.onClick ? <Text key={item.title} component="button" type="button" variant="link" onClick={item.onClick}>{item.title}</Text> : <Text key={item.title} fw={600}>{item.title}</Text>)}</Breadcrumbs>
            <Group gap="sm"><Title order={1} fz={30} fw={650}>{server.name}</Title><Badge color={statusColor} variant="light">{server.running ? 'Running' : 'Stopped'}</Badge></Group>
            <Text c="dimmed" size="sm">{server.type} · {server.workdir || 'Workspace path not reported'}</Text>
          </Stack>
          <Group align="center">
            {server.running ? <Button variant="light" color="gray" leftSection={<IconPlayerStop size={16} />} loading={busy} onClick={() => action('stop')}>Stop</Button> : <Button leftSection={<IconPlayerPlay size={16} />} loading={busy} onClick={() => action('start')}>Start</Button>}
            <Menu shadow="md" width={178} position="bottom-end"><Menu.Target><ActionIcon variant="default" size="lg"><IconDotsVertical size={18} /></ActionIcon></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<IconRefresh size={15} />} onClick={() => action('restart')}>Restart</Menu.Item><Menu.Divider /><Menu.Item color="red" leftSection={<IconTrash size={15} />} onClick={() => setConfirmKill(true)}>Kill process</Menu.Item></Menu.Dropdown></Menu>
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
          <Tabs.List><Tabs.Tab value="overview" leftSection={<IconWorld size={15} />}>Overview</Tabs.Tab><Tabs.Tab value="console" leftSection={<IconTerminal2 size={15} />}>Console</Tabs.Tab><Tabs.Tab value="files" leftSection={<IconFolderOpen size={15} />}>Files</Tabs.Tab><Tabs.Tab value="backups" leftSection={<IconCloud size={15} />}>Backups</Tabs.Tab><Tabs.Tab value="settings" leftSection={<IconSettings size={15} />}>Settings</Tabs.Tab></Tabs.List>

          <Tabs.Panel value="overview" className="mjt-tab-panel"><SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}><Card padding="lg"><Text c="dimmed" size="xs" tt="uppercase" fw={700}>Software</Text><Text fw={650} mt={8}>{server.type}</Text></Card><Card padding="lg"><Text c="dimmed" size="xs" tt="uppercase" fw={700}>Port</Text><Text fw={650} mt={8}>{server.port ?? '—'}</Text></Card><Card padding="lg"><Text c="dimmed" size="xs" tt="uppercase" fw={700}>Version</Text><Text fw={650} mt={8}>{server.version || 'Not reported'}</Text></Card><Card padding="lg"><Text c="dimmed" size="xs" tt="uppercase" fw={700}>Status</Text><Text fw={650} mt={8}>{server.running ? 'Online' : 'Offline'}</Text></Card></SimpleGrid><Card mt="md" p="lg"><Group justify="space-between"><div><Text fw={650}>Quick actions</Text><Text c="dimmed" size="sm">Open console or manage server files from this workspace.</Text></div><Group><Button variant="light" onClick={() => setActiveTab('console')}>Open console</Button><Button variant="default" onClick={() => setActiveTab('files')}>Browse files</Button></Group></Group></Card></Tabs.Panel>

          <Tabs.Panel value="console" className="mjt-tab-panel"><Card p="lg"><Group justify="space-between" mb="sm"><Text fw={650}>Live console</Text><Button size="xs" variant="subtle" leftSection={<IconRefresh size={14} />} onClick={refreshLogs}>Refresh</Button></Group><Paper withBorder bg="dark.9" p="md" mih={360}><Text component="pre" c="gray.2" className="mjt-console">{logs.join('\n') || 'No logs yet.'}</Text></Paper><Group mt="md" align="end"><TextInput label="Command" placeholder="list" value={command} onChange={(event) => setCommand(event.currentTarget.value)} onKeyDown={(event) => event.key === 'Enter' && void sendCommand()} style={{ flex: 1 }} /><Button loading={busy} leftSection={<IconRocket size={16} />} onClick={sendCommand}>Send</Button></Group></Card></Tabs.Panel>

          <Tabs.Panel value="files" className="mjt-tab-panel">{capabilities.files ? <Card p="lg"><Group justify="space-between" mb="md"><div><Text fw={650}>File manager</Text><Text c="dimmed" size="sm">Workspace sandbox: {server.name}</Text></div><Group><Button variant="default" leftSection={<IconArrowLeft size={15} />} disabled={!path} onClick={() => void loadFiles(relativeParent(path))}>Up</Button><Button leftSection={<IconRefresh size={15} />} loading={fileLoading} onClick={() => void loadFiles(path)}>Load files</Button></Group></Group>{fileError && <Alert color="red" mb="md">{fileError}</Alert>}<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md"><Paper withBorder p="sm" mih={340}><Text size="xs" c="dimmed" mb="sm">/{path}</Text><Stack gap={4}>{files.length ? files.map((entry) => <Button key={entry.path} variant="subtle" color="gray" justify="space-between" leftSection={entry.directory ? <IconFolder size={16} color="#d97706" /> : <IconFile size={16} />} rightSection={<Text size="xs" c="dimmed">{entry.directory ? 'folder' : prettySize(entry.size)}</Text>} onClick={() => void openFile(entry)}>{entry.name}</Button>) : <Text c="dimmed" size="sm" p="md">Click Load files to open this workspace.</Text>}</Stack></Paper><Paper withBorder p="sm" mih={340}><Group justify="space-between" mb="sm"><Text size="sm" fw={600}>{openedFile || 'Select a file'}</Text>{openedFile && <Button size="xs" leftSection={<IconDeviceFloppy size={14} />} loading={busy} onClick={saveFile}>Save</Button>}</Group><Textarea autosize minRows={14} value={content} onChange={(event) => setContent(event.currentTarget.value)} placeholder="Choose a text file to edit." styles={{ input: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 } }} /></Paper></SimpleGrid></Card> : <Unavailable title="File manager is not installed in this MJT Core yet" text="The panel will enable this tab once the workspace file API is available." />}</Tabs.Panel>

          <Tabs.Panel value="backups" className="mjt-tab-panel"><Unavailable title="Backups are not installed yet" text="This workspace is ready for backups UI when the core backup API is added." /></Tabs.Panel>
          <Tabs.Panel value="settings" className="mjt-tab-panel"><Card p="lg"><Text fw={650}>Server settings</Text><Text c="dimmed" size="sm" mt={4}>Advanced process, environment and network settings will live here. For now, use the existing MJT command configuration for changes.</Text></Card></Tabs.Panel>
        </Tabs>
      </Box>

      <Modal opened={confirmKill} onClose={() => setConfirmKill(false)} title="Kill server process" centered><Stack><Alert color="red" icon={<IconAlertTriangle size={16} />}>This stops the process immediately. The server may not save recent data.</Alert><Group justify="flex-end"><Button variant="default" onClick={() => setConfirmKill(false)}>Cancel</Button><Button color="red" loading={busy} onClick={() => action('kill')}>Kill process</Button></Group></Stack></Modal>
    </Box>
  );
}

function Unavailable({ title, text }: { title: string; text: string }) { return <Card p="xl"><Stack align="center" gap="xs"><ThemeIcon size={48} radius="xl" variant="light" color="gray"><IconFilePlus size={23} /></ThemeIcon><Title order={3}>{title}</Title><Text c="dimmed" ta="center" maw={480}>{text}</Text></Stack></Card>; }
