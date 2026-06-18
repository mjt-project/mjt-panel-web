import { useState } from 'react';
import { Alert, Button, Card, Checkbox, Code, Divider, Group, Select, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface Props {
  apiBase: string;
  demo: boolean;
  onApiBase: (value: string) => void;
}

export function SettingsPage({ apiBase, demo, onApiBase }: Props) {
  const [base, setBase] = useState(apiBase);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactTables, setCompactTables] = useState(false);
  const [confirmDangerous, setConfirmDangerous] = useState(true);

  const save = () => {
    const value = base.trim() || '/api';
    onApiBase(value);
    localStorage.setItem('mjtPanelAutoRefresh', String(autoRefresh));
    localStorage.setItem('mjtPanelCompactTables', String(compactTables));
    localStorage.setItem('mjtPanelConfirmDangerous', String(confirmDangerous));
    notifications.show({ color: 'teal', title: 'Panel preferences saved', message: 'Browser-only preferences have been updated.' });
  };

  return (
    <Stack gap="lg">
      <div><Title order={2}>Settings</Title><Text c="dimmed">Frontend preferences and connection settings.</Text></div>
      <Alert color="indigo" variant="light">These settings belong to the web panel in your browser. MJT Core server settings remain managed from its own config and commands.</Alert>

      <Card withBorder radius="lg" padding="lg">
        <Title order={3} mb="md">Connection</Title>
        <Stack gap="md">
          <TextInput label="API base" description="Use /api when the panel is served by MJT Core. For standalone development, use your proxy target." value={base} onChange={(event) => setBase(event.currentTarget.value)} />
          <Group><Text size="sm" c="dimmed">Current mode:</Text><Code>{demo ? 'demo' : 'live-api'}</Code></Group>
        </Stack>
      </Card>

      <Card withBorder radius="lg" padding="lg">
        <Title order={3} mb="md">Panel behavior</Title>
        <Stack gap="md">
          <Switch checked={autoRefresh} onChange={(event) => setAutoRefresh(event.currentTarget.checked)} label="Auto refresh console and status" description="Refresh active console output while the page is open." />
          <Switch checked={compactTables} onChange={(event) => setCompactTables(event.currentTarget.checked)} label="Compact data tables" description="Use tighter spacing in Files, Players and Backups pages." />
          <Switch checked={confirmDangerous} onChange={(event) => setConfirmDangerous(event.currentTarget.checked)} label="Confirm dangerous actions" description="Show a confirmation dialog before stop, kill, delete and restore actions." />
        </Stack>
      </Card>

      <Card withBorder radius="lg" padding="lg">
        <Title order={3} mb="md">Appearance</Title>
        <Stack gap="md"><Select label="Color scheme" value="light" data={[{ value: 'light', label: 'Light (default)' }, { value: 'dark', label: 'Dark (planned)' }]} disabled description="Light-first UI is currently the supported design baseline." /><Text size="sm" c="dimmed">Font: Be Vietnam Pro for interface text and JetBrains Mono for logs/editor content.</Text></Stack>
      </Card>

      <Group justify="flex-end"><Button onClick={save}>Save preferences</Button></Group>
    </Stack>
  );
}
