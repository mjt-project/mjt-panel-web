import { useState } from 'react';
import { Alert, Anchor, Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowRight, IconInfoCircle, IconLock, IconSparkles } from '@tabler/icons-react';

interface Props {
  initialApiBase: string;
  initialToken: string;
  busy: boolean;
  error?: string;
  onSubmit: (apiBase: string, token: string) => void;
  onDemo: () => void;
}

export function LoginPage({ initialApiBase, initialToken, busy, error, onSubmit, onDemo }: Props) {
  const [apiBase, setApiBase] = useState(initialApiBase);
  const [token, setToken] = useState(initialToken);

  return (
    <Center className="mjt-page-shell" p="md">
      <Paper w="100%" maw={440} p={32} shadow="sm">
        <Stack gap="lg">
          <Stack gap={8}>
            <div className="mjt-logo">M</div>
            <Title order={1} fz={28}>Welcome to MJT</Title>
            <Text c="dimmed" size="sm">A simple control panel for the services you run inside your server workspace.</Text>
          </Stack>

          <Alert variant="light" color="indigo" icon={<IconInfoCircle size={16} />}>
            Use your panel token. For local UI development, enter <strong>dev</strong> on localhost.
          </Alert>

          <TextInput label="API base" value={apiBase} onChange={(event) => setApiBase(event.currentTarget.value)} description="Keep /api when the panel is served by MJT." />
          <PasswordInput label="Panel token" value={token} onChange={(event) => setToken(event.currentTarget.value)} leftSection={<IconLock size={16} />} placeholder="Paste your panel token" onKeyDown={(event) => event.key === 'Enter' && onSubmit(apiBase, token)} />

          {error && <Alert color="red" title="Sign in failed">{error}</Alert>}

          <Button loading={busy} rightSection={<IconArrowRight size={16} />} onClick={() => onSubmit(apiBase, token)}>Sign in</Button>
          <Button variant="subtle" leftSection={<IconSparkles size={16} />} onClick={onDemo}>Open demo workspace</Button>

          <Text size="xs" c="dimmed" ta="center">
            Need a new token? Run <Anchor component="span" fw={600}>.mjt panel token reset</Anchor> in MJT.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
