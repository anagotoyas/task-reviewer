import { Stack, NavLink, Text, Group, Avatar, Button } from '@mantine/core';
import {
  IconUsers,
  IconBook,
  IconClipboardList,
  IconVideo,
  IconLayoutDashboard,
  IconLogout,
  IconSchool,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { apiClient } from '@/lib/api-client';

const adminLinks = [
  { label: 'Usuarios', icon: IconUsers, href: '/admin/users' },
  { label: 'Cursos', icon: IconSchool, href: '/admin/courses' },
  { label: 'Dashboard', icon: IconLayoutDashboard, href: '/admin/analytics' },
];

const teacherLinks = [
  { label: 'Mis cursos', icon: IconSchool, href: '/teacher/courses' },
  { label: 'Rúbricas', icon: IconBook, href: '/teacher/rubrics' },
  { label: 'Tareas', icon: IconClipboardList, href: '/teacher/homeworks' },
];

const studentLinks = [
  { label: 'Mis cursos', icon: IconSchool, href: '/student/courses' },
  { label: 'Mis tareas', icon: IconClipboardList, href: '/student/homeworks' },
  { label: 'Mis entregas', icon: IconVideo, href: '/student/submissions' },
];

export function NavbarContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const links =
    user?.role.name === 'admin'
      ? adminLinks
      : user?.role.name === 'teacher'
        ? teacherLinks
        : studentLinks;

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <Stack h="100%" justify="space-between" p="md">
      <Stack gap="xs">
        {links.map((link) => (
          <NavLink
            key={link.href}
            label={link.label}
            leftSection={<link.icon size={18} />}
            active={location.pathname.startsWith(link.href)}
            onClick={() => navigate(link.href)}
          />
        ))}
      </Stack>

      <Stack gap="xs">
        <Group gap="sm" p="xs">
          <Avatar color="cyan" radius="xl">
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Stack gap={0} style={{ flex: 1, overflow: 'hidden' }}>
            <Text size="sm" fw={500} truncate>
              {user?.name} {user?.lastname}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {user?.role.name}
            </Text>
          </Stack>
        </Group>
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
          fullWidth
          justify="flex-start"
        >
          Cerrar sesión
        </Button>
      </Stack>
    </Stack>
  );
}
