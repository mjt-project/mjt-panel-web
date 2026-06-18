import { useEffect, useMemo, useState } from 'react';
import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { createApi, type MjtApi } from '../api/client';
import type { CoreStatus, InstallRequest, MinecraftProfile } from '../api/types';
import { authStorage } from '../features/auth/storage';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ServersPage } from '../features/servers/ServersPage';
import { InstallerPage } from '../features/installer/InstallerPage';
import { ConsolePage } from '../features/console/ConsolePage';
import { FilesPage } from '../features/files/FilesPage';
import { BackupsPage } from '../features/backups/BackupsPage';
import { PlayersPage } from '../features/players/PlayersPage';
import { NetworkPage } from '../features/network/NetworkPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SystemPage } from '../features/system/SystemPage';
import { EmptyState } from '../shared/components/EmptyState';
import { ConfirmActionModal } from '../shared/components/ConfirmActionModal';
import { PanelLayout } from './PanelLayout';

export function App() {
  const [token, setToken] = useState(authStorage.token());
  const [apiBase, setApiBase] = useState(authStorage.apiBase());
  const [demo, setDemo] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [page, setPage] = useState('dashboard');
  const [status, setStatus] = useState<CoreStatus | null>(null);
  const [profiles, setProfiles] = useState<MinecraftProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [navOpened, navControl] = useDisclosure(false);
  const [pending, setPending] = useState<{ action: 'stop' | 'restart' | 'kill'; profile: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const api = useMemo<MjtApi>(() => createApi({ baseUrl: apiBase, token, demo }), [apiBase, token, demo]);

  const refresh = async () => {
    const [nextStatus, result] = await Promise.all([api.getStatus(), api.getProfiles()]);
    const nextProfiles = Array.isArray(result) ? result : result.profiles || [];
    setStatus(nextStatus);
    setProfiles(nextProfiles);
    setSelectedProfile((current) => current || nextStatus.activeProfile || nextProfiles[0]?.name || '');
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.checkAuth().then(async () => { await refresh(); setAuthenticated(true); }).catch(() => { authStorage.clear(); setToken(''); }).finally(() => setLoading(false));
  }, []);

  const login = async (nextToken: string, nextBase: string, nextDemo: boolean) => {
    const client = createApi({ baseUrl: nextBase, token: nextToken, demo: nextDemo });
    await client.checkAuth();
    authStorage.save(nextToken, nextBase);
    setToken(nextToken); setApiBase(nextBase); setDemo(nextDemo);
    const [nextStatus, result] = await Promise.all([client.getStatus(), client.getProfiles()]);
    const nextProfiles = Array.isArray(result) ? result : result.profiles || [];
    setStatus(nextStatus); setProfiles(nextProfiles); setSelectedProfile(nextStatus.activeProfile || nextProfiles[0]?.name || ''); setAuthenticated(true);
  };

  const updateApiBase = (nextBase: string) => {
    authStorage.save(token, nextBase);
    setApiBase(nextBase);
  };

  const doAction = async (action: 'start' | 'stop' | 'restart' | 'kill', profile: string) => {
    if (!profile) return;
    if (action === 'stop' || action === 'restart' || action === 'kill') { setPending({ action, profile }); return; }
    await runAction(action, profile);
  };

  const runAction = async (action: 'start' | 'stop' | 'restart' | 'kill', profile: string) => {
    setActionLoading(true);
    try {
      await api.action(profile, action);
      notifications.show({ color: 'teal', title: 'Action sent', message: `${action} was sent to ${profile}` });
      await refresh();
    } catch (error) {
      notifications.show({ color: 'red', title: 'Action failed', message: error instanceof Error ? error.message : 'Unknown error' });
    } finally { setActionLoading(false); setPending(null); }
  };

  const install = async (request: InstallRequest) => {
    await api.install(request);
    await refresh();
    notifications.show({ color: 'teal', title: 'Server installed', message: `${request.profile} is ready to start` });
    setSelectedProfile(request.profile);
    setPage('servers');
  };

  const logout = () => {
    authStorage.clear(); setToken(''); setDemo(false); setAuthenticated(false); setProfiles([]); setStatus(null); setPage('dashboard'); setSelectedProfile('');
  };

  if (loading) return <Center mih="100vh"><Stack align="center"><Loader color="indigo" /><Text c="dimmed">Connecting to MJT Panel…</Text></Stack></Center>;
  if (!authenticated) return <LoginPage defaultApiBase={apiBase} defaultToken={token} onLogin={login} />;

  const content = (() => {
    switch (page) {
      case 'dashboard': return <DashboardPage status={status} profiles={profiles} selectedProfile={selectedProfile} demo={demo} onSelect={setSelectedProfile} onStart={(profile) => doAction('start', profile)} onGo={setPage} />;
      case 'servers': return <ServersPage profiles={profiles} selectedProfile={selectedProfile} onSelect={setSelectedProfile} onAction={doAction} onGo={setPage} />;
      case 'installer': return <InstallerPage onInstall={install} />;
      case 'console': return selectedProfile ? <ConsolePage api={api} profile={selectedProfile} /> : <EmptyState title="Choose a profile" description="Select a Minecraft profile from the top bar before opening console." action={<Button onClick={() => setPage('servers')}>Open servers</Button>} />;
      case 'files': return <FilesPage api={api} profile={selectedProfile} />;
      case 'backups': return <BackupsPage api={api} profile={selectedProfile} />;
      case 'players': return <PlayersPage api={api} profile={selectedProfile} />;
      case 'network': return <NetworkPage api={api} />;
      case 'settings': return <SettingsPage apiBase={apiBase} demo={demo} onApiBase={updateApiBase} />;
      case 'system': return <SystemPage api={api} status={status} />;
      default: return <EmptyState title="Page not found" description="Return to Dashboard and try again." action={<Button onClick={() => setPage('dashboard')}>Dashboard</Button>} />;
    }
  })();

  return <>
    <PanelLayout page={page} profiles={profiles} selectedProfile={selectedProfile} demo={demo} opened={navOpened} onToggle={navControl.toggle} onPage={setPage} onProfile={setSelectedProfile} onLogout={logout}>{content}</PanelLayout>
    <ConfirmActionModal opened={Boolean(pending)} action={pending?.action || null} profile={pending?.profile || ''} loading={actionLoading} onClose={() => setPending(null)} onConfirm={() => pending && runAction(pending.action, pending.profile)} />
  </>;
}
