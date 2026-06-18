import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Center, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface Props { children: ReactNode; }
interface State { error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(_: Error, __: ErrorInfo) {}

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Center h="100vh" p="md">
        <Paper p="xl" maw={520} shadow="sm">
          <Stack gap="md">
            <IconAlertTriangle color="#dc2626" size={34} />
            <Title order={2}>Panel could not start</Title>
            <Text c="dimmed">The UI hit an unexpected error. Reload the page. If it continues, open browser console and check the latest panel release.</Text>
            <Alert color="red" title="Error">{this.state.error.message}</Alert>
            <Button leftSection={<IconRefresh size={16} />} onClick={() => location.reload()}>Reload panel</Button>
          </Stack>
        </Paper>
      </Center>
    );
  }
}
