import { useState } from 'react';
import {
  Title,
  Button,
  Group,
  Table,
  Badge,
  ActionIcon,
  Text,
  Stack,
  Skeleton,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useUsers, useDeleteUser } from '@/features/users/hooks/useUsers';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { User } from '@/types';

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Docente',
  student: 'Estudiante',
};

const roleColor: Record<string, string> = {
  admin: 'violet',
  teacher: 'blue',
  student: 'green',
};

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const openCreate = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const confirmDelete = (user: User) => {
    modals.openConfirmModal({
      title: 'Eliminar usuario',
      centered: true,
      children: (
        <Text size="sm">
          ¿Eliminar a <strong>{user.name} {user.lastname}</strong>? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(user.id),
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Gestión de usuarios</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Nuevo usuario
        </Button>
      </Group>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} height={48} radius="sm" />
          ))}
        </Stack>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th w={100}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users?.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  {user.name} {user.lastname}
                </Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Badge color={roleColor[user.role.name]} variant="light">
                    {roleLabel[user.role.name]}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon variant="subtle" onClick={() => openEdit(user)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => confirmDelete(user)}
                        loading={deleteMutation.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <UserFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        editUser={editUser}
      />
    </Stack>
  );
}
