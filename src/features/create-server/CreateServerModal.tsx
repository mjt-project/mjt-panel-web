import { useEffect, useState } from 'react';
import { Alert, Button, Checkbox, Group, Modal, NumberInput, Radio, SimpleGrid, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';
import { IconBrandMinecraft, IconCheck, IconInfoCircle, IconServer } from '@tabler/icons-react';

export type CreateServerInput = { software: 'velocity' | 'paper' | 'purpur'; profile: string; version: string; build: string; port: number; memory: string; acceptEula: boolean; force: boolean; };

interface Props { opened: boolean; busy: boolean; error?: string; onClose: () => void; onCreate: (input: CreateServerInput) => void; }

const descriptions = {
  velocity: 'A lightweight Java proxy. Use it as the public entry point for multiple Minecraft servers.',
  paper: 'A high-performance server for SMP and plugins. Good default for a regular Minecraft world.',
  purpur: 'Paper-based server with extra gameplay configuration. Useful for highly customized servers.'
};

export function CreateServerModal({ opened, busy, error, onClose, onCreate }: Props) {
  const [software, setSoftware] = useState<CreateServerInput['software']>('paper');
  const [profile, setProfile] = useState('smp');
  const [version, setVersion] = useState('latest');
  const [build, setBuild] = useState('latest');
  const [port, setPort] = useState<number>(25566);
  const [memory, setMemory] = useState('1G');
  const [acceptEula, setAcceptEula] = useState(true);
  const [force, setForce] = useState(false);

  useEffect(() => {
    const recipe = software === 'velocity' ? { profile: 'velocity', port: 25565, memory: '512M', eula: false } : software === 'paper' ? { profile: 'smp', port: 25566, memory: '1G', eula: true } : { profile: 'lobby', port: 25567, memory: '1G', eula: true };
    setProfile(recipe.profile); setPort(recipe.port); setMemory(recipe.memory); setAcceptEula(recipe.eula);
  }, [software]);

  const valid = profile.trim().length > 0 && (software === 'velocity' || acceptEula);

  return (
    <Modal opened={opened} onClose={onClose} title="Create a Minecraft server" centered size="lg" overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}>
      <Stack gap="lg">
        <Text c="dimmed" size="sm">Choose server software first. MJT will create the workspace, download the jar and prepare a start script.</Text>
        <Radio.Group value={software} onChange={(value) => setSoftware(value as CreateServerInput['software'])}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            {(['velocity', 'paper', 'purpur'] as const).map((item) => (
              <Radio.Card key={item} value={item} withBorder p="md" radius="md">
                <Group align="flex-start" wrap="nowrap">
                  <ThemeIcon variant="light" color={item === 'velocity' ? 'violet' : item === 'paper' ? 'blue' : 'grape'}><IconBrandMinecraft size={17} /></ThemeIcon>
                  <div><Text fw={650} tt="capitalize">{item}</Text><Text size="xs" c="dimmed">{descriptions[item].split('. ')[0]}</Text></div>
                </Group>
              </Radio.Card>
            ))}
          </SimpleGrid>
        </Radio.Group>
        <Alert variant="light" color="indigo" icon={<IconInfoCircle size={16} />}>{descriptions[software]}</Alert>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Server name" value={profile} onChange={(e) => setProfile(e.currentTarget.value)} description="Used as the workspace and server profile ID." />
          <NumberInput label="Port" value={port} onChange={(value) => setPort(Number(value) || 0)} min={1} max={65535} />
          <TextInput label="Minecraft version" value={version} onChange={(e) => setVersion(e.currentTarget.value)} placeholder="latest" />
          <TextInput label="Build" value={build} onChange={(e) => setBuild(e.currentTarget.value)} placeholder="latest" />
          <TextInput label="Memory" value={memory} onChange={(e) => setMemory(e.currentTarget.value)} placeholder="1G" />
        </SimpleGrid>
        {software !== 'velocity' && <Checkbox checked={acceptEula} onChange={(event) => setAcceptEula(event.currentTarget.checked)} label="I accept the Minecraft EULA for this server." />}
        <Checkbox checked={force} onChange={(event) => setForce(event.currentTarget.checked)} label="Replace the existing jar if this profile already exists." />
        {error && <Alert color="red">{error}</Alert>}
        <Group justify="flex-end"><Button variant="default" onClick={onClose}>Cancel</Button><Button leftSection={<IconCheck size={16} />} loading={busy} disabled={!valid} onClick={() => onCreate({ software, profile: profile.trim(), version: version || 'latest', build: build || 'latest', port, memory, acceptEula, force })}>Create server</Button></Group>
      </Stack>
    </Modal>
  );
}
