import type { PropsWithChildren, ReactNode } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export type ControlFramePage = 'workspaces' | 'environments' | 'services' | 'network' | 'server';
export type CoreConnectionState = 'checking' | 'ready' | 'unavailable';

interface Props extends PropsWithChildren {
  active: ControlFramePage;
  connection: CoreConnectionState;
  onWorkspaces: () => void;
  onEnvironments: () => void;
  onServices: () => void;
  onNetwork: () => void;
  onRefresh?: () => void;
}

export function ControlFrame({ children, active, connection, onWorkspaces, onEnvironments, onServices, onNetwork, onRefresh }: Props) {
  const connected = connection === 'ready';
  const connectionLabel = connection === 'checking' ? 'Checking Core…' : connected ? 'Core connected' : 'Control API unavailable';
  return (
    <main className="mjt-control-frame">
      <header className="mjt-topbar" aria-label="MJT primary navigation">
        <button type="button" className="mjt-brand" onClick={onWorkspaces} aria-label="Open MJT workspaces"><span className="mjt-brand-mark">M</span><span>MJT</span></button>
        <nav className="mjt-topbar-nav" aria-label="Workspace sections">
          <button type="button" data-active={active === 'workspaces'} onClick={onWorkspaces}>Workspaces</button>
          <button type="button" data-active={active === 'environments'} onClick={onEnvironments}>Environments</button>
          <button type="button" data-active={active === 'services'} onClick={onServices}>Services</button>
          <button type="button" data-active={active === 'network'} onClick={onNetwork}>Network</button>
        </nav>
        <Group gap={8} wrap="nowrap">
          {onRefresh && <Tooltip label="Refresh workspace data"><Button variant="subtle" px={8} aria-label="Refresh workspace data" onClick={onRefresh}><IconRefresh size={17} /></Button></Tooltip>}
          <span className="mjt-connection" title={connectionLabel}><span className="mjt-status-dot" data-state={connection} />{connectionLabel}</span>
        </Group>
      </header>
      <section className="mjt-page">{children}</section>
    </main>
  );
}

export function PageHeader({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: ReactNode }) {
  return <div className="mjt-page-header"><div><div className="mjt-page-eyebrow">{eyebrow}</div><h1 className="mjt-page-heading">{title}</h1><p className="mjt-page-copy">{copy}</p></div>{actions && <div>{actions}</div>}</div>;
}
