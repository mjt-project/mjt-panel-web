import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Alert, Badge, Button, Card, Group, Menu, Modal, Stack, Table, Text, Textarea, TextInput, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowUp, IconDeviceFloppy, IconFile, IconFilePlus, IconFolder, IconFolderPlus, IconPencil, IconRefresh, IconTrash } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';
import type { FileEntry } from '../../api/types';
import { EmptyState } from '../../shared/components/EmptyState';

interface Props { api: MjtApi; profile: string; }
type ModalMode = 'new-file' | 'new-folder' | 'rename' | 'delete' | null;

export function FilesPage({ api, profile }: Props) {
  const [path, setPath] = useState('');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [modalValue, setModalValue] = useState('');
  const [message, setMessage] = useState('');

  const load = async (nextPath = path) => {
    if (!profile) return;
    setLoading(true); setMessage('');
    try {
      const result = await api.listFiles(profile, nextPath);
      setPath(result.path || nextPath); setEntries(result.entries || []); setSelected(null); setContent('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Cannot list files'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (profile) load(''); }, [profile]);

  const open = async (entry: FileEntry) => {
    if (entry.type === 'directory') return load(entry.path);
    try {
      const result = await api.readFile(profile, entry.path);
      setSelected(entry); setContent(result.content || '');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Cannot read file'); }
  };

  const save = async () => {
    if (!selected) return;
    try { await api.saveFile(profile, selected.path, content); notifications.show({ color: 'teal', title: 'File saved', message: selected.path }); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Cannot save file'); }
  };

  const parent = useMemo(() => path.includes('/') ? path.split('/').slice(0, -1).join('/') : '', [path]);
  const joinPath = (name: string) => path ? `${path}/${name}`.replace(/\/+/g, '/') : name;

  const openModal = (mode: ModalMode, entry?: FileEntry) => {
    setModal(mode);
    setModalValue(mode === 'rename' && entry ? entry.name : '');
    if (entry) setSelected(entry);
  };

  const submitModal = async () => {
    const name = modalValue.trim();
    if (!modal) return;
    try {
      if (modal === 'new-file') await api.createFile(profile, joinPath(name));
      if (modal === 'new-folder') await api.createDirectory(profile, joinPath(name));
      if (modal === 'rename' && selected) await api.renameFile(profile, selected.path, joinPath(name));
      if (modal === 'delete' && selected) await api.deleteFile(profile, selected.path);
      notifications.show({ color: modal === 'delete' ? 'teal' : 'indigo', title: 'File action completed', message: modal === 'delete' ? 'Entry deleted' : 'Directory listing refreshed' });
      setModal(null); setModalValue(''); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'File action failed'); }
  };

  if (!profile) return <EmptyState title="Choose a profile" description="Select a Minecraft profile from the top bar before opening its files." />;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start"><div><Title order={2}>Files</Title><Text c="dimmed">Everything is scoped to the selected profile workdir.</Text></div><Group><Button variant="default" leftSection={<IconFilePlus size={16} />} onClick={() => openModal('new-file')}>New file</Button><Button leftSection={<IconFolderPlus size={16} />} onClick={() => openModal('new-folder')}>New folder</Button></Group></Group>
      <Alert color="indigo" variant="light">MJT Core must normalize every path and reject <code>../</code> traversal or symlinks that escape the profile workdir.</Alert>
      {message && <Alert color="red">{message}</Alert>}

      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" mb="md"><div><Title order={3}>Explorer</Title><Text size="sm" c="dimmed">{profile} / {path || '.'}</Text></div><Group><Tooltip label="Parent folder"><ActionIcon variant="default" onClick={() => load(parent)} disabled={!path}><IconArrowUp size={17} /></ActionIcon></Tooltip><Tooltip label="Refresh"><ActionIcon variant="default" loading={loading} onClick={() => load()}><IconRefresh size={17} /></ActionIcon></Tooltip></Group></Group>
        <Group mb="md"><TextInput style={{ flex: 1 }} value={path} onChange={(event) => setPath(event.currentTarget.value)} placeholder="Relative path" /><Button variant="default" onClick={() => load(path)}>Open path</Button></Group>
        {!entries.length ? <EmptyState title="Folder is empty" description="Create a file or folder here to get started." /> : <Table verticalSpacing="sm" highlightOnHover><Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Type</Table.Th><Table.Th>Size</Table.Th><Table.Th>Modified</Table.Th><Table.Th /></Table.Tr></Table.Thead><Table.Tbody>{entries.map((entry) => <Table.Tr key={entry.path} style={{ cursor: 'pointer' }} onClick={() => open(entry)}><Table.Td><Group gap="xs">{entry.type === 'directory' ? <IconFolder size={17} color="#4f46e5" /> : <IconFile size={17} color="#64748b" />}<Text size="sm" fw={entry.type === 'directory' ? 600 : 400}>{entry.name}</Text></Group></Table.Td><Table.Td><Badge variant="light" color={entry.type === 'directory' ? 'indigo' : 'gray'}>{entry.type}</Badge></Table.Td><Table.Td><Text size="sm" c="dimmed">{entry.size ?? '—'}</Text></Table.Td><Table.Td><Text size="sm" c="dimmed">{entry.modifiedAt ?? '—'}</Text></Table.Td><Table.Td onClick={(event) => event.stopPropagation()}><Menu shadow="md" position="bottom-end"><Menu.Target><ActionIcon variant="subtle" color="gray">•••</ActionIcon></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<IconPencil size={15} />} onClick={() => openModal('rename', entry)}>Rename</Menu.Item><Menu.Item color="red" leftSection={<IconTrash size={15} />} onClick={() => openModal('delete', entry)}>Delete</Menu.Item></Menu.Dropdown></Menu></Table.Td></Table.Tr>)}</Table.Tbody></Table>}
      </Card>

      {selected?.type === 'file' && <Card withBorder radius="lg" padding="lg"><Group justify="space-between" mb="md"><div><Title order={4}>{selected.path}</Title><Text size="xs" c="dimmed">Editing file content</Text></div><Button leftSection={<IconDeviceFloppy size={16} />} onClick={save}>Save file</Button></Group><Textarea autosize minRows={18} value={content} onChange={(event) => setContent(event.currentTarget.value)} styles={{ input: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12 } }} /></Card>}

      <Modal opened={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'new-file' ? 'Create file' : modal === 'new-folder' ? 'Create folder' : modal === 'rename' ? 'Rename entry' : 'Delete entry'} centered>
        <Stack>{modal === 'delete' ? <Text size="sm" c="dimmed">Delete <strong>{selected?.path}</strong>? This cannot be undone.</Text> : <TextInput autoFocus label={modal === 'rename' ? 'New name' : 'Name'} placeholder={modal === 'new-file' ? 'notes.txt' : 'new-folder'} value={modalValue} onChange={(event) => setModalValue(event.currentTarget.value)} />}
          <Group justify="flex-end"><Button variant="default" onClick={() => setModal(null)}>Cancel</Button><Button color={modal === 'delete' ? 'red' : 'indigo'} onClick={submitModal}>{modal === 'delete' ? 'Delete' : 'Confirm'}</Button></Group></Stack>
      </Modal>
    </Stack>
  );
}
