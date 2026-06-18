import { useEffect, useMemo, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { ApiClient } from '../api/client';
import type { Capabilities, PanelStatus, ServerProfile } from '../api/types';
import { LoginPage } from '../features/auth/LoginPage';
import { clearToken, localDevEnabled, readApiBase, readToken, saveApiBase, saveToken } from '../features/auth/storage';
import { HomePage } from '../features/home/HomePage';
import { CreateServerModal, type CreateServerInput } from '../features/create-server/CreateServerModal';
import { ServerDetailPage } from '../features/server-detail/ServerDetailPage';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { theme } from '../theme/theme';

function MainApp() {
  const [token, setToken] = useState(readToken());
  const [apiBase, setApiBase] = useState(readApiBase());
  const [demo, setDemo] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [servers, setServers] = useState<ServerProfile[]>([]);
  const [status, setStatus] = useState<PanelStatus>({});
  const [capabilities, setCapabilities] = useState<Capabilities>({ files: false, backups: false, players: false, network: false, system: false });
  const [selected, setSelected] = useState<ServerProfile>();
  const [createOpen, setCreateOpen] = useState(false);
  const [installError, setInstallError] = useState<string>();

  const api = useMemo(() => new ApiClient(apiBase, token, demo), [apiBase, token, demo]);

  const loadPanelFor = async (client: ApiClient) => {
    const [nextStatus, nextServers, nextCapabilities] = await Promise.all([client.status(), client.servers(), client.capabilities()]);
    setStatus(nextStatus);
    setServers(nextServers);
    setCapabilities(nextCapabilities);
    setSelected((current) => current ? nextServers.find((server) => server.name === current.name) : undefined);
  };

  const loadPanel = async () => loadPanelFor(api);

  const authenticate = async (nextApiBase: string, nextToken: string) => {
    setBusy(true); setError(undefined);
    const useDemo = localDevEnabled(nextToken);
    const nextApi = new ApiClient(nextApiBase, nextToken, useDemo);
    try {
      await nextApi.checkAuth();
      const [nextStatus, nextServers, nextCapabilities] = await Promise.all([nextApi.status(), nextApi.servers(), nextApi.capabilities()]);
      saveApiBase(nextApiBase);
      saveToken(nextToken);
      setStatus(nextStatus);
      setServers(nextServers);
      setCapabilities(nextCapabilities);
      setApiBase(nextApiBase);
      setToken(nextToken);
      setDemo(useDemo);
      setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally { setBusy(false); }
  };

  const openDemo = async () => {
    const nextApi = new ApiClient('/api', 'dev', true);
    setBusy(true); setError(undefined);
    try {
      await nextApi.checkAuth();
      const [nextStatus, nextServers, nextCapabilities] = await Promise.all([nextApi.status(), nextApi.servers(), nextApi.capabilities()]);
      setStatus(nextStatus);
      setServers(nextServers);
      setCapabilities(nextCapabilities);
      setApiBase('/api');
      setToken('dev');
      setDemo(true);
      setAuthenticated(true);
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!token || authenticated) return;
    void authenticate(apiBase, token);
  }, []);

  const createServer = async (input: CreateServerInput) => {
    setBusy(true); setInstallError(undefined);
    try {
      await api.install({ software: input.software, provider: input.software, profile: input.profile, version: input.version, build: input.build, port: input.port, memory: input.memory, acceptEula: input.acceptEula, force: input.force });
      setCreateOpen(false); await loadPanel();
      notifications.show({ title: 'Server created', message: `${input.profile} is ready to manage.`, color: 'teal' });
    } catch (reason) { setInstallError(reason instanceof Error ? reason.message : 'Install failed.'); }
    finally { setBusy(false); }
  };

  if (!authenticated) return <LoginPage initialApiBase={apiBase} initialToken={token} busy={busy} error={error} onSubmit={authenticate} onDemo={openDemo} />;

  if (selected) return <ServerDetailPage server={selected} api={api} capabilities={capabilities} onBack={() => setSelected(undefined)} onChanged={loadPanel} />;

  return <><HomePage servers={servers} loading={busy} onCreate={() => setCreateOpen(true)} onManage={setSelected} onRefresh={() => void loadPanel()} /><CreateServerModal opened={createOpen} busy={busy} error={installError} onClose={() => setCreateOpen(false)} onCreate={createServer} /></>;
}

export function App() {
  return <MantineProvider theme={theme} defaultColorScheme="light"><Notifications position="top-right" /><ErrorBoundary><MainApp /></ErrorBoundary></MantineProvider>;
}
