import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  opened: boolean;
  action: 'stop' | 'restart' | 'kill' | null;
  profile: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmActionModal({ opened, action, profile, loading, onClose, onConfirm }: Props) {
  const isKill = action === 'kill';
  const title = action ? `${action[0].toUpperCase()}${action.slice(1)} ${profile}` : 'Confirm action';

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Alert color={isKill ? 'red' : 'yellow'} icon={<IconAlertTriangle size={16} />}>
          {isKill ? 'Kill stops the Java process immediately. Use it only if normal stop does not work.' : `Confirm ${action} for this server profile.`}
        </Alert>
        <Text size="sm" c="dimmed">Profile: <strong>{profile}</strong></Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color={isKill ? 'red' : action === 'stop' ? 'orange' : 'indigo'} loading={loading} onClick={onConfirm}>Confirm</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
