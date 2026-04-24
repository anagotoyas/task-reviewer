import { AppShell, Burger, Group, Title, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSun, IconMoon, IconBrandYoutube } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { NavbarContent } from './NavbarContent';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15aabf' }}>
              <IconBrandYoutube size="1.5rem" />
              <Title order={4} styles={{ root: { color: '#15aabf' } }}>MySpace</Title>
            </div>
          </Group>
          <ActionIcon
            variant="subtle"
            onClick={toggleColorScheme}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <NavbarContent />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
