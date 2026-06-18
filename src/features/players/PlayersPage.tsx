import { useEffect, useState } from 'react';
import { ActionIcon, Alert, Avatar, Badge, Button, Card, Group, Menu, Stack, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBan, IconCrown, IconDots, IconDoorExit, IconUserCheck, IconRefresh, IconShieldCheck, IconUserPlus, IconUserX } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';
import type { PlayerItem } from '../../api/types';
import { EmptyState } from '../../shared/components/EmptyState';

interface Props { api: MjtApi; profile: string; }

export function PlayersPage({ api, profile }: Props) {
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    try { const result = await api.listPlayers(profile); setPlayers(result.players || []); }
    catch (error) { notifications.show({ color: 'red', title: 'Could not load players', message: error instanceof Error ? error.message : 'Unknown error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [profile]);

  const run = async (action: string, player: string) => {
    try { await api.playerAction(profile, action, player); notifications.show({ color: 'teal', title: 'Player action sent', message: `${action} → ${player}` }); await load(); }
    catch (error) { notifications.show({ color: 'red', title: 'Player action failed', message: error instanceof Error ? error.message : 'Unknown error' }); }
  };

  if (!profile) return <EmptyState title="Choose a profile" description="Select a Minecraft profile from the top bar before managing players." />;

  const online = players.filter((player) => player.online);
  return (
    <Stack gap="lg">
      <Group justify="space-between"><div><Title order={2}>Players</Title><Text c="dimmed">Manage player access for {profile}.</Text></div><Button variant="default" leftSection={<IconRefresh size={16} />} loading={loading} onClick={load}>Refresh</Button></Group>
      <Alert color="indigo" variant="light">Player actions are UI-ready. The MJT Core can implement them using normal Minecraft console commands such as <code>kick</code>, <code>ban</code>, <code>op</code> and whitelist commands.</Alert>
      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" mb="md"><div><Title order={3}>Online now</Title><Text size="sm" c="dimmed">{online.length} player{online.length === 1 ? '' : 's'} connected</Text></div><Badge color="teal" variant="light">{online.length} online</Badge></Group>
        {!players.length ? <EmptyState title="No player data" description="The selected server has not reported players yet." /> : <Table verticalSpacing="sm" highlightOnHover><Table.Thead><Table.Tr><Table.Th>Player</Table.Th><Table.Th>Connection</Table.Th><Table.Th>Permissions</Table.Th><Table.Th /><Table.Th /></Table.Tr></Table.Thead><Table.Tbody>{players.map((player) => <Table.Tr key={player.name}>
          <Table.Td><Group gap="sm"><Avatar color={player.online ? 'indigo' : 'gray'} radius="xl">{player.name.slice(0, 1).toUpperCase()}</Avatar><div><Text fw={600}>{player.name}</Text><Text size="xs" c="dimmed">{player.uuid || 'UUID unavailable'}</Text></div></Group></Table.Td>
          <Table.Td>{player.online ? <Group gap={5}><ThemeIcon size="sm" radius="xl" color="teal" variant="light"><IconUserCheck size={12} /></ThemeIcon><Text size="sm">{player.ping ?? '—'} ms</Text></Group> : <Text size="sm" c="dimmed">Last seen {player.joinedAt || '—'}</Text>}</Table.Td>
          <Table.Td><Group gap={6}>{player.op && <Badge variant="light" color="yellow" leftSection={<IconCrown size={12} />}>OP</Badge>}{player.whitelisted && <Badge variant="light" color="teal" leftSection={<IconShieldCheck size={12} />}>Allowed</Badge>}{!player.op && !player.whitelisted && <Text size="sm" c="dimmed">Standard</Text>}</Group></Table.Td>
          <Table.Td>{player.online ? <Badge color="teal" variant="light">Online</Badge> : <Badge color="gray" variant="light">Offline</Badge>}</Table.Td>
          <Table.Td><Menu shadow="md" position="bottom-end"><Menu.Target><ActionIcon variant="subtle" color="gray"><IconDots size={18} /></ActionIcon></Menu.Target><Menu.Dropdown>
            <Menu.Label>{player.name}</Menu.Label>
            {player.online && <Menu.Item leftSection={<IconDoorExit size={15} />} onClick={() => run('kick', player.name)}>Kick player</Menu.Item>}
            <Menu.Item leftSection={player.op ? <IconUserX size={15} /> : <IconCrown size={15} />} onClick={() => run(player.op ? 'deop' : 'op', player.name)}>{player.op ? 'Remove operator' : 'Make operator'}</Menu.Item>
            <Menu.Item leftSection={player.whitelisted ? <IconUserX size={15} /> : <IconUserPlus size={15} />} onClick={() => run(player.whitelisted ? 'whitelist-remove' : 'whitelist-add', player.name)}>{player.whitelisted ? 'Remove from whitelist' : 'Add to whitelist'}</Menu.Item>
            <Menu.Divider /><Menu.Item color="red" leftSection={<IconBan size={15} />} onClick={() => run('ban', player.name)}>Ban player</Menu.Item>
          </Menu.Dropdown></Menu></Table.Td>
        </Table.Tr>)}</Table.Tbody></Table>}
      </Card>
    </Stack>
  );
}
