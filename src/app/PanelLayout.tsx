import type { PropsWithChildren } from 'react';
import { ActionIcon, AppShell, Avatar, Burger, Group, Indicator, NavLink, Select, Text, Tooltip } from '@mantine/core';
import {
  IconArchive,
  IconBrandMinecraft,
  IconCloudDownload,
  IconFolder,
  IconGauge,
  IconLogout,
  IconNetwork,
  IconSettings,
  IconShield,
  IconTerminal2,
  IconUsers,
} from '@tabler/icons-react';
import type { MinecraftProfile } from '../api/types';

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: IconGauge },
  { key: 'servers', label: 'Servers', icon: IconBrandMinecraft },
  { key: 'installer', label: 'Installer', icon: IconCloudDownload },
  { key: 'console', label: 'Console', icon: IconTerminal2 },
  { key: 'files', label: 'Files', icon: IconFolder },
  { key: 'backups', label: 'Backups', icon: IconArchive },
  { key: 'players', label: 'Players', icon: IconUsers },
  { key: 'network', label: 'Network', icon: IconNetwork },
  { key: 'settings', label: 'Settings', icon: IconSettings },
  { key: 'system', label: 'System', icon: IconShield },
];

interface Props extends PropsWithChildren {
  page: string;
  profiles: MinecraftProfile[];
  selectedProfile: string;
  demo: boolean;
  opened: boolean;
  onToggle: () => void;
  onPage: (page: string) => void;
  onProfile: (profile: string) => void;
  onLogout: () => void;
}

export function PanelLayout({ children, page, profiles, selectedProfile, demo, opened, onToggle, onPage, onProfile, onLogout }: Props) {
  return (
    <AppShell header={{ height: 66 }} navbar={{ width: 252, breakpoint: 'sm', collapsed: { mobile: !opened } }} padding="lg">
      <AppShell.Header px="lg">
        <Group h="100%" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
            <Avatar color="indigo" radius="md"><IconBrandMinecraft size={18} /></Avatar>
            <div><Text fw={750}>MJT Panel</Text><Text size="xs" c="dimmed">{demo ? 'Demo workspace' : 'Connected workspace'}</Text></div>
          </Group>
          <Group gap="sm">
            <Select w={230} visibleFrom="sm" data={profiles.map((profile) => ({ value: profile.name, label: `${profile.name}${profile.running ? ' · running' : ''}` }))} value={selectedProfile || null} placeholder="No profile selected" onChange={(value) => value && onProfile(value)} />
            <Tooltip label="Logout"><ActionIcon variant="subtle" color="gray" onClick={onLogout}><IconLogout size={18} /></ActionIcon></Tooltip>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        <AppShell.Section grow>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" py="xs">Workspace</Text>
          {navigation.map((item) => <NavLink key={item.key} active={page === item.key} label={item.label} leftSection={<item.icon size={18} stroke={1.8} />} onClick={() => onPage(item.key)} />)}
        </AppShell.Section>
        <AppShell.Section pt="sm">
          <Group gap="xs" px="sm"><Indicator color={demo ? 'teal' : 'indigo'} processing={!demo} size={8} /><Text size="xs" c="dimmed">{demo ? 'Demo mode' : 'MJT Core API'}</Text></Group>
          <Text size="xs" c={demo ? 'teal' : 'indigo'} px="sm" pt={4}>{demo ? 'Mock workspace enabled' : 'Live connection enabled'}</Text>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
