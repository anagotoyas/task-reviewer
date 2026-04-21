import { useState } from 'react';
import {
  Title,
  Button,
  Group,
  Table,
  ActionIcon,
  Text,
  Stack,
  Skeleton,
  Tooltip,
  Badge,
  Menu,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconSend,
  IconLock,
  IconFileText,
  IconUsers,
} from '@tabler/icons-react';
import { useHomeworks, useDeleteHomework, useUpdateHomework } from '@/features/homeworks/hooks/useHomeworks';
import { HomeworkFormModal } from '@/features/homeworks/components/HomeworkFormModal';
import { GroupsModal } from '@/features/homeworks/components/GroupsModal';
import { Homework, HomeworkStatus } from '@/types';

const statusColor: Record<HomeworkStatus, string> = {
  draft: 'gray',
  published: 'green',
  closed: 'red',
};

const statusLabel: Record<HomeworkStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  closed: 'Cerrada',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function HomeworksPage() {
  const { data: homeworks, isLoading } = useHomeworks();
  const deleteMutation = useDeleteHomework();
  const updateMutation = useUpdateHomework();

  const [modalOpen, setModalOpen] = useState(false);
  const [editHomework, setEditHomework] = useState<Homework | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [groupsHomework, setGroupsHomework] = useState<Homework | null>(null);

  const openCreate = () => {
    setEditHomework(null);
    setModalOpen(true);
  };

  const openEdit = (hw: Homework) => {
    setEditHomework(hw);
    setModalOpen(true);
  };

  const openGroups = (hw: Homework) => {
    setGroupsHomework(hw);
    setGroupsOpen(true);
  };

  const changeStatus = (hw: Homework, status: HomeworkStatus) => {
    updateMutation.mutate({ id: hw.id, payload: { status } });
  };

  const confirmDelete = (hw: Homework) => {
    modals.openConfirmModal({
      title: 'Eliminar tarea',
      centered: true,
      children: (
        <Text size="sm">
          ¿Eliminar la tarea <strong>{hw.name}</strong>? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(hw.id),
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Mis tareas</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Nueva tarea
        </Button>
      </Group>

      {isLoading ? (
        <Stack gap="xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </Stack>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Curso</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Inicio</Table.Th>
              <Table.Th>Cierre</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th w={120}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {homeworks?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text c="dimmed" ta="center" size="sm" py="md">
                    No tienes tareas creadas aún.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {homeworks?.map((hw) => (
              <Table.Tr key={hw.id}>
                <Table.Td fw={500}>{hw.name}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{hw.course?.name ?? '—'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={hw.isGroup ? 'teal' : 'blue'} size="sm">
                    {hw.isGroup ? 'Grupal' : 'Individual'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(hw.startDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(hw.endDate)}</Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={160}>
                    <Menu.Target>
                      <Badge
                        color={statusColor[hw.status]}
                        variant="light"
                        style={{ cursor: 'pointer' }}
                        rightSection={<IconChevronDown size={10} />}
                      >
                        {statusLabel[hw.status]}
                      </Badge>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Cambiar estado</Menu.Label>
                      <Menu.Item
                        leftSection={<IconFileText size={14} />}
                        disabled={hw.status === 'draft'}
                        onClick={() => changeStatus(hw, 'draft')}
                      >
                        Borrador
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconSend size={14} />}
                        disabled={hw.status === 'published'}
                        onClick={() => changeStatus(hw, 'published')}
                      >
                        Publicar
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconLock size={14} />}
                        disabled={hw.status === 'closed'}
                        color="red"
                        onClick={() => changeStatus(hw, 'closed')}
                      >
                        Cerrar
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {hw.isGroup && (
                      <Tooltip label="Gestionar grupos">
                        <ActionIcon variant="subtle" color="teal" onClick={() => openGroups(hw)}>
                          <IconUsers size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Editar">
                      <ActionIcon variant="subtle" onClick={() => openEdit(hw)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => confirmDelete(hw)}
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

      <HomeworkFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        editHomework={editHomework}
      />

      <GroupsModal
        opened={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        homework={groupsHomework}
      />
    </Stack>
  );
}
