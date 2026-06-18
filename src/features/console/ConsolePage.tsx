import { useEffect, useState } from 'react';
import { ActionIcon, Button, Card, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay, IconRefresh, IconSend, IconTrash } from '@tabler/icons-react';
import type { MjtApi } from '../../api/client';

interface Props { api: MjtApi; profile: string; }

export function ConsolePage({ api, profile }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [paused, setPaused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const load = async () => {
    if (!profile || paused) return;
    try { const result = await api.logs(profile); setLines(result.lines || []); } catch (error) { setLines([`Cannot load logs: ${error instanceof Error ? error.message : 'Unknown error'}`]); }
  };

  useEffect(() => {
    setLines([]);
    load();
    const timer = window.setInterval(load, 1800);
    return () => window.clearInterval(timer);
  }, [profile, paused]);

  const send = async () => {
    const value = command.trim();
    if (!value || !profile) return;
    await api.sendCommand(profile, value);
    setHistory((current) => [value, ...current.filter((item) => item !== value)].slice(0, 8));
    setCommand('');
    await load();
  };

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" mb="md"><div><Title order={3}>Console</Title><Text size="sm" c="dimmed">Profile: {profile || 'Select a profile first'}</Text></div><Group gap="xs"><Tooltip label={paused ? 'Resume logs' : 'Pause logs'}><ActionIcon variant="default" onClick={() => setPaused((value) => !value)}>{paused ? <IconPlayerPlay size={17} /> : <IconPlayerPause size={17} />}</ActionIcon></Tooltip><Tooltip label="Refresh"><ActionIcon variant="default" onClick={load}><IconRefresh size={17} /></ActionIcon></Tooltip><Tooltip label="Clear screen"><ActionIcon variant="default" onClick={() => setLines([])}><IconTrash size={17} /></ActionIcon></Tooltip></Group></Group>
      <pre className="mjt-console">{lines.join('\n') || 'No log output yet.'}</pre>
      <Group mt="md" align="flex-end"><TextInput style={{ flex: 1 }} label="Command" placeholder="list" value={command} onChange={(event) => setCommand(event.currentTarget.value)} onKeyDown={(event) => event.key === 'Enter' && send()} /><Button leftSection={<IconSend size={16} />} onClick={send} disabled={!profile}>Send</Button></Group>
      {history.length > 0 && <Group gap="xs" mt="md">{history.map((item) => <Button key={item} size="compact-sm" variant="subtle" onClick={() => setCommand(item)}>{item}</Button>)}</Group>}
    </Card>
  );
}
