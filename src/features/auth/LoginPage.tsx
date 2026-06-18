import { useState } from 'react';
import { Alert, Box, Button, Card, Center, Divider, Group, PasswordInput, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconBrandMinecraft, IconInfoCircle, IconLogin2, IconSparkles } from '@tabler/icons-react';

interface Props {
  defaultApiBase: string;
  defaultToken: string;
  onLogin: (token: string, apiBase: string, demo: boolean) => Promise<void>;
}

export function LoginPage({ defaultApiBase, defaultToken, onLogin }: Props) {
  const [token, setToken] = useState(defaultToken);
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (demo: boolean) => {
    setLoading(true);
    setError('');
    try {
      await onLogin(demo ? 'dev' : token.trim(), apiBase.trim() || '/api', demo);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" px="md" style={{ background: 'radial-gradient(circle at 15% 5%, #e0e7ff 0, transparent 28%), #f7f8fc' }}>
      <Card withBorder radius="lg" shadow="sm" padding={32} w="100%" maw={440}>
        <Stack gap="lg">
          <Group gap="sm">
            <ThemeIcon size={48} radius="md" variant="light" color="indigo"><IconBrandMinecraft size={26} /></ThemeIcon>
            <Box>
              <Title order={2} size="h3">MJT Panel</Title>
              <Text c="dimmed" size="sm">Mini Java Terminal control center</Text>
            </Box>
          </Group>

          <Alert icon={<IconInfoCircle size={16} />} color="indigo" variant="light" title="Sign in to continue">
            Use your MJT panel token. For local UI work, use Demo Mode instead of a real server.
          </Alert>

          <TextInput label="API base" description="Use /api when served by MJT Core" value={apiBase} onChange={(event) => setApiBase(event.currentTarget.value)} />
          <PasswordInput label="Panel token" placeholder="Paste token from .mjt panel token reset" value={token} onChange={(event) => setToken(event.currentTarget.value)} onKeyDown={(event) => event.key === 'Enter' && submit(false)} />

          {error && <Alert color="red" title="Sign in failed">{error}</Alert>}

          <Button leftSection={<IconLogin2 size={17} />} loading={loading} onClick={() => submit(false)}>Sign in</Button>
          <Button variant="default" leftSection={<IconSparkles size={17} />} loading={loading} onClick={() => submit(true)}>Open demo mode</Button>

          <Divider />
          <Text size="xs" c="dimmed">Need a token? Run <code>.mjt panel token reset</code> in the MJT console.</Text>
        </Stack>
      </Card>
    </Center>
  );
}
