import { useEffect, useMemo, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import '../theme/phase6.css';
import { ApiClient } from '../api/client';
import type { Capabilities, PanelStatus, ServerProfile } from '../api/types';
import { PanelControlApi, readControlApiBase, saveControlApiBase } from '../api/control-v1';
import { LoginPage } from '../features/auth/LoginPage';
import { localDevEnabled, readApiBase, readToken, saveApiBase, saveToken } from '../features/auth/storage';
import { HomePage } from '../features/home/HomePage';
import { CreateServerModal, type CreateServerInput } from '../features/create-server/CreateServerModal';
import { ServerDetailPage } from '../features/server-detail/ServerDetailPage';
import { ServiceManagerPage } from '../features/services/ServiceManagerPage';
import { NetworkPage } from '../features/network/NetworkPage';
import { ControlFrame } from '../ui/ControlFrame';
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [controlApiBase, setControlApiBase] = useState(() => readControlApiBase(readApiBase()));
  const [createOpen, setCreateOpen] = useState(false);
  const [installError, setInstallError] = useState<string>();

  const api = useMemo(() => new ApiClient(apiBase, token, demo), [apiBase, token, demo]);
  const controlApi = useMemo(() => new PanelControlApi(controlApiBase, token), [controlApiBase, token]);

  const loadPanelFor = async (client: ApiClient) => {
    const [nextStatus, nextServers, nextCapabilities] = await Promise.all([
      client.status(), client.servers(), client.capabilities(),
    ]);
    setStatus(nextStatus);
    setServers(nextServers);
    setCapabilities(nextCapabilities);
    setSelected((current) => current ? nextServers.find((server) => server.name === current.name) : undefined);
  };

  const loadPanel = async () => {
    setBusy(true);
    try {
      await loadPanelFor(api);
    } catch (reason) {
      notifications.show({ color: 'red', title: 'Workspace refresh failed', message: reason instanceof Error ? reason.message : 'Could not reload MJT state.' });
    } finally {
      setBusy(false);
    }
  };

  const authenticate = async (nextApiBase: string, nextToken: string) => {
    setBusy(true); setError(undefined);
    const useDemo = localDevEnabled(nextToken);
    const nextApi = new ApiClient(nextApiBase, nextToken, useDemo);
    try {
      await nextApi.checkAuth();
      const [nextStatus, nextServers, nextCapabilities] = await Promise.all([
        nextApi.status(), nextApi.servers(), nextApi.capabilities(),
      ]);
      saveApiBase(nextApiBase); saveToken(nextToken);
      setStatus(nextStatus); setServers(nextServers); setCapabilities(nextCapabilities);
      setApiBase(nextApiBase); setToken(nextToken); setDemo(useDemo); setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally { setBusy(false); }
  };

  const openDemo = async () => {
    const nextApi = new ApiClient('/api', 'dev', true);
    setBusy(true); setError(undefined);
    try {
      await nextApi.checkAuth();
      const [nextStatus, nextServers, nextCapabilities] = await Promise.all([
        nextApi.status(), nextApi.servers(), nextApi.capabilities(),
      ]);
      setStatus(nextStatus); setServers(nextServers); setCapabilities(nextCapabilities);
      setApiBase('/api'); setToken('dev'); setDemo(true); setAuthenticated(true);
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!token || authenticated) return;
    void authenticate(apiBase, token);
    // Persisted credentials are intentionally restored only once at app boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createServer = async (input: CreateServerInput) => {
    setBusy(true); setInstallError(undefined);
    try {
      await api.install({ software: input.software, provider: input.software, profile: input.profile, version: input.version, build: input.build, port: input.port, memory: input.memory, acceptEula: input.acceptEula, force: input.force });
      setCreateOpen(false);
      await loadPanelFor(api);
      notifications.show({ title: 'Server created', message: `${input.profile} is ready to manage.`, color: 'teal' });
    } catch (reason) {
      setInstallError(reason instanceof Error ? reason.message : 'Install failed.');
    } finally { setBusy(false); }
  };

  const openWorkspaces = () => {
    setSelected(undefined);
    setServicesOpen(false);
    setNetworkOpen(false);
  };
  const openServices = () => {
    setSelected(undefined);
    setNetworkOpen(false);
    setServicesOpen(true);
  };
  const openNetwork = () => {
    setSelected(undefined);
    setServicesOpen(false);
    setNetworkOpen(true);
  };
  const openServer = (server: ServerProfile) => {
    setServicesOpen(false);
    setNetworkOpen(false);
    setSelected(server);
  };

  if (!authenticated) {
    return <LoginPage initialApiBase={apiBase} initialToken={token} busy={busy} error={error} onSubmit={authenticate} onDemo={openDemo} />;
  }

  const active = servicesOpen ? 'services' : networkOpen ? 'network' : selected ? 'server' : 'workspaces';
  return (
    <ControlFrame active={active} connected={!error} onWorkspaces={openWorkspaces} onServices={openServices} onNetwork={openNetwork} onRefresh={() => void loadPanel()}>
      {servicesOpen ? (
        <ServiceManagerPage
          api={controlApi}
          apiBase={controlApiBase}
          onApiBaseChange={(next) => { saveControlApiBase(next); setControlApiBase(next); }}
          onBack={openWorkspaces}
        />
      ) : networkOpen ? (
        <NetworkPage api={controlApi} onBack={openWorkspaces} />
      ) : selected ? (
        <ServerDetailPage server={selected} api={api} capabilities={capabilities} onBack={openWorkspaces} onChanged={loadPanel} />
      ) : (
        <>
          <HomePage servers={servers} loading={busy} onCreate={() => setCreateOpen(true)} onManage={openServer} onRefresh={() => void loadPanel()} onServices={openServices} onNetwork={openNetwork} />
          <CreateServerModal opened={createOpen} busy={busy} error={installError} onClose={() => setCreateOpen(false)} onCreate={createServer} />
        </>
      )}
    </ControlFrame>
  );
}

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <ErrorBoundary><MainApp /></ErrorBoundary>
    </MantineProvider>
  );
}
