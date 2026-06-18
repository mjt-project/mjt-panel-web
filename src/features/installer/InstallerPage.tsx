import { useState } from 'react';
import { Alert, Button, Card, Checkbox, Code, Group, NumberInput, Paper, Select, SimpleGrid, Stack, Stepper, Text, TextInput, Title } from '@mantine/core';
import { IconCircleCheck, IconDownload, IconInfoCircle } from '@tabler/icons-react';
import type { InstallRequest } from '../../api/types';

interface Props { onInstall: (request: InstallRequest) => Promise<void>; }

const recipes = {
  velocity: { profile: 'velocity', port: 25565, memory: '512M', eula: false },
  paper: { profile: 'smp', port: 25566, memory: '1G', eula: true },
  purpur: { profile: 'lobby', port: 25567, memory: '1G', eula: true },
};

export function InstallerPage({ onInstall }: Props) {
  const [software, setSoftware] = useState<'velocity' | 'paper' | 'purpur'>('paper');
  const [profile, setProfile] = useState('smp');
  const [version, setVersion] = useState('latest');
  const [build, setBuild] = useState('latest');
  const [port, setPort] = useState<number>(25566);
  const [memory, setMemory] = useState('1G');
  const [acceptEula, setAcceptEula] = useState(true);
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const chooseRecipe = (value: 'velocity' | 'paper' | 'purpur') => {
    const recipe = recipes[value];
    setSoftware(value); setProfile(recipe.profile); setPort(recipe.port); setMemory(recipe.memory); setAcceptEula(recipe.eula); setVersion('latest'); setBuild('latest');
  };

  const submit = async () => {
    if (!profile.trim()) return setMessage('Profile name is required.');
    if (software !== 'velocity' && !acceptEula) return setMessage('Paper/Purpur requires accepting the EULA.');
    setLoading(true); setMessage('Downloading server files and preparing profile…');
    try {
      await onInstall({ software, provider: software, profile: profile.trim(), version: version || 'latest', build: build || 'latest', port, memory: memory || '1G', acceptEula, force });
      setMessage(`Installed ${software} profile “${profile}”. You can now open Servers and start it.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Install failed');
    } finally { setLoading(false); }
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} color="indigo" variant="light">The installer creates the profile workdir, downloads the selected server software and writes a runnable <Code>start.sh</Code>.</Alert>
      <SimpleGrid cols={{ base: 1, lg: 3 }}>
        {(Object.keys(recipes) as Array<keyof typeof recipes>).map((item) => <Paper key={item} withBorder radius="lg" p="md" style={{ cursor: 'pointer', borderColor: item === software ? '#818cf8' : undefined }} onClick={() => chooseRecipe(item)}><Text fw={700}>{item[0].toUpperCase() + item.slice(1)}</Text><Text size="sm" c="dimmed">{item === 'velocity' ? 'Java proxy server' : 'Minecraft Java server'}</Text></Paper>)}
      </SimpleGrid>
      <Card withBorder radius="lg" padding="xl">
        <Title order={3} mb="lg">Install {software[0].toUpperCase() + software.slice(1)}</Title>
        <Stepper active={0} size="sm" mb="xl"><Stepper.Step label="Choose" description="Software" /><Stepper.Step label="Configure" description="Profile" /><Stepper.Step label="Install" description="Ready" /></Stepper>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select label="Software" data={['velocity', 'paper', 'purpur']} value={software} onChange={(value) => chooseRecipe((value || 'paper') as typeof software)} />
          <TextInput label="Profile name" value={profile} onChange={(event) => setProfile(event.currentTarget.value)} />
          <TextInput label="Minecraft version" description="Use latest or a known Minecraft version" value={version} onChange={(event) => setVersion(event.currentTarget.value)} />
          <TextInput label="Build" description="Use latest unless a specific build is required" value={build} onChange={(event) => setBuild(event.currentTarget.value)} />
          <NumberInput label="Port" min={1024} max={65535} value={port} onChange={(value) => setPort(Number(value) || 25565)} />
          <TextInput label="Java memory" value={memory} onChange={(event) => setMemory(event.currentTarget.value)} />
        </SimpleGrid>
        <Stack mt="lg" gap="xs">
          {software !== 'velocity' && <Checkbox checked={acceptEula} onChange={(event) => setAcceptEula(event.currentTarget.checked)} label="I accept the Minecraft EULA for this server" />}
          <Checkbox checked={force} onChange={(event) => setForce(event.currentTarget.checked)} label="Replace existing server jar if found" />
        </Stack>
        {message && <Alert mt="lg" color={message.startsWith('Installed') ? 'teal' : message.includes('required') || message.includes('requires') || message.includes('failed') ? 'red' : 'blue'}>{message}</Alert>}
        <Group justify="flex-end" mt="xl"><Button leftSection={<IconDownload size={16} />} loading={loading} onClick={submit}>Install server</Button></Group>
      </Card>
    </Stack>
  );
}
