import type { PropsWithChildren, ReactNode } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export type ControlFramePage = 'workspaces' | 'services' | 'network' | 'server';

interface Props extends PropsWithChildren {
  active: ControlFramePage;
  connected: boolean;
  onWorkspaces: () => void;
  onServices: () => void;
  onNetwork: () => void;
  onRefresh?: () => void;
}

export function ControlFrame({
  children,
  active,
  connected,
  onWorkspaces,
  onServices,
  onNetwork,
  onRefresh,
}: Props) {
  return (
    <main className="mjt-control-frame">
      <header className="mjt-topbar" aria-label="MJT primary navigation">
        <button type="button" className="mjt-brand" onClick={onWorkspaces} aria-label="Open MJT workspaces">
          <span className="mjt-brand-mark">M</span>
          <span>MJT</span>
        </button>

        <nav className="mjt-topbar-nav" aria-label="Workspace sections">
          <button type="button" data-active={active === 'workspaces'} onClick={onWorkspaces}>
            Workspaces
          </button>
          <button type="button" data-active={active === 'services'} onClick={onServices}>
            Services
          </button>
          <button type="button" data-active={active === 'network'} onClick={onNetwork}>
            Network
          </button>
        </nav>

        <Group gap={8} wrap="nowrap">
          {onRefresh && (
            <Tooltip label="Refresh workspace data">
              <Button variant="subtle" px={8} aria-label="Refresh workspace data" onClick={onRefresh}>
                <IconRefresh size={17} />
              </Button>
            </Tooltip>
          )}
          <span className="mjt-connection" title={connected ? 'MJT Core API connected' : 'MJT Core API unavailable'}>
            <span className="mjt-status-dot" style={{ opacity: connected ? 1 : 0.35 }} />
            {connected ? 'Core connected' : 'Connection unavailable'}
          </span>
        </Group>
      </header>
      <section className="mjt-page">{children}</section>
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mjt-page-header">
      <div>
        <div className="mjt-page-eyebrow">{eyebrow}</div>
        <h1 className="mjt-page-heading">{title}</h1>
        <p className="mjt-page-copy">{copy}</p>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
