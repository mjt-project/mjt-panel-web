import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Alert, Badge, Button, Card, Group, Menu, Modal, Paper, SimpleGrid, Stack, Table, Text, TextInput, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArchive, IconClock, IconDatabase, IconDots, IconPlus, IconRestore, IconTrash } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';
import type { BackupItem } from '../../api/types';
import { EmptyState } from '../../shared/components/EmptyState';

interface Props {
  api: MjtApi;
  profile: string;
}

export function BackupsPage({ api, profile }: Props) {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpened, setCreateOpened] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [pendingRestore, setPendingRestore] = useState<BackupItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BackupItem | null>(null);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await api.listBackups(profile);
      setBackups(result.backups || []);
    } catch (error) {
      notifications.show({ color: 'red', title: 'Could not load backups', message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profile]);

  const totalSize = useMemo(() => backups.reduce((total, item) => total + parseFloat(item.size) || total, 0), [backups]);

  const create = async () => {
    try {
      await api.createBackup(profile, backupName.trim() || undefined);
      notifications.show({ color: 'teal', title: 'Backup created', message: `A new backup was created for ${profile}` });
      setBackupName(''); setCreateOpened(false); await load();
    } catch (error) {
      notifications.show({ color: 'red', title: 'Backup failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const restore = async () => {
    if (!pendingRestore) return;
    try {
      await api.restoreBackup(profile, pendingRestore.id);
      notifications.show({ color: 'teal', title: 'Restore started', message: `${pendingRestore.name} will be restored to ${profile}` });
      setPendingRestore(null);
    } catch (error) {
      notifications.show({ color: 'red', title: 'Restore failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      await api.deleteBackup(profile, pendingDelete.id);
      notifications.show({ color: 'teal', title: 'Backup deleted', message: pendingDelete.name });
      setPendingDelete(null); await load();
    } catch (error) {
      notifications.show({ color: 'red', title: 'Delete failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (!profile) return <EmptyState title="Choose a profile" description="Select a Minecraft profile from the top bar before managing backups." />;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div><Title order={2}>Backups</Title><Text c="dimmed">Create restore points before updates or major changes.</Text></div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>Create backup</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <SummaryCard icon={<IconArchive size={18} />} label="Backups" value={String(backups.length)} detail={`for ${profile}`} />
        <SummaryCard icon={<IconDatabase size={18} />} label="Stored size" value={backups.length ? `~${totalSize.toFixed(0)} MB` : '0 MB'} detail="reported archive size" />
        <SummaryCard icon={<IconClock size={18} />} label="Latest" value={backups[0]?.createdAt || '—'} detail="most recent backup" />
      </SimpleGrid>

      <Alert color="yellow" variant="light">Restoring a backup replaces files in the selected profile workdir. Stop the server before restoring in production.</Alert>

      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" mb="md"><div><Title order={3}>Available backups</Title><Text size="sm" c="dimmed">Profile: {profile}</Text></div><Button variant="default" loading={loading} onClick={load}>Refresh</Button></Group>
        {!backups.length ? <EmptyState title="No backups yet" description="Create your first restore point before modifying your server." /> :
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Created</Table.Th><Table.Th>Size</Table.Th><Table.Th>Status</Table.Th><Table.Th /></Table.Tr></Table.Thead>
            <Table.Tbody>{backups.map((backup) => <Table.Tr key={backup.id}>
              <Table.Td><Group gap="sm"><ThemeIcon variant="light" color="indigo"><IconArchive size={16} /></ThemeIcon><div><Text fw={600}>{backup.name}</Text><Text size="xs" c="dimmed">{backup.id}</Text></div></Group></Table.Td>
              <Table.Td><Text size="sm">{backup.createdAt}</Text></Table.Td>
              <Table.Td><Text size="sm">{backup.size}</Text></Table.Td>
              <Table.Td><Badge color={backup.status === 'ready' ? 'teal' : backup.status === 'creating' ? 'yellow' : 'red'} variant="light">{backup.status}</Badge></Table.Td>
              <Table.Td><Menu shadow="md" position="bottom-end"><Menu.Target><ActionIcon variant="subtle" color="gray"><IconDots size={18} /></ActionIcon></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<IconRestore size={15} />} onClick={() => setPendingRestore(backup)}>Restore backup</Menu.Item><Menu.Divider /><Menu.Item color="red" leftSection={<IconTrash size={15} />} onClick={() => setPendingDelete(backup)}>Delete backup</Menu.Item></Menu.Dropdown></Menu></Table.Td>
            </Table.Tr>)}</Table.Tbody>
          </Table>}
      </Card>

      <Modal opened={createOpened} onClose={() => setCreateOpened(false)} title="Create backup" centered>
        <Stack><Text size="sm" c="dimmed">The backup will include the selected profile workdir. You can leave the name blank to use an automatic timestamp.</Text><TextInput label="Backup name" placeholder="Before plugin update" value={backupName} onChange={(event) => setBackupName(event.currentTarget.value)} /><Group justify="flex-end"><Button variant="default" onClick={() => setCreateOpened(false)}>Cancel</Button><Button onClick={create}>Create backup</Button></Group></Stack>
      </Modal>

      <ConfirmBackupModal opened={Boolean(pendingRestore)} title="Restore this backup?" text="Current server files will be replaced. This action should be performed while the server is stopped." confirm="Restore backup" color="indigo" onClose={() => setPendingRestore(null)} onConfirm={restore} />
      <ConfirmBackupModal opened={Boolean(pendingDelete)} title="Delete this backup?" text="The archive will be permanently deleted and cannot be restored." confirm="Delete backup" color="red" onClose={() => setPendingDelete(null)} onConfirm={remove} />
    </Stack>
  );
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Paper withBorder radius="lg" p="md"><Group justify="space-between"><div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text><Text fw={700} size="lg">{value}</Text><Text size="xs" c="dimmed">{detail}</Text></div><ThemeIcon variant="light" color="indigo" size="lg">{icon}</ThemeIcon></Group></Paper>;
}

function ConfirmBackupModal({ opened, title, text, confirm, color, onClose, onConfirm }: { opened: boolean; title: string; text: string; confirm: string; color: string; onClose: () => void; onConfirm: () => void }) {
  return <Modal opened={opened} onClose={onClose} title={title} centered><Stack><Text size="sm" c="dimmed">{text}</Text><Group justify="flex-end"><Button variant="default" onClick={onClose}>Cancel</Button><Button color={color} onClick={onConfirm}>{confirm}</Button></Group></Stack></Modal>;
}
