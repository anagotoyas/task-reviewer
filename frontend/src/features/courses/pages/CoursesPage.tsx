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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import { useCourses, useDeleteCourse } from '@/features/courses/hooks/useCourses';
import { CourseFormModal } from '@/features/courses/components/CourseFormModal';
import { AssignStudentsModal } from '@/features/courses/components/AssignStudentsModal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Course } from '@/types';

export function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const deleteMutation = useDeleteCourse();
  const { user } = useAuthStore();
  const isAdmin = user?.role.name === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [assignCourse, setAssignCourse] = useState<Course | null>(null);

  const openCreate = () => {
    setEditCourse(null);
    setFormOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setFormOpen(true);
  };

  const openAssign = (course: Course) => {
    setAssignCourse(course);
    setAssignOpen(true);
  };

  const confirmDelete = (course: Course) => {
    modals.openConfirmModal({
      title: 'Eliminar curso',
      centered: true,
      children: (
        <Text size="sm">
          ¿Eliminar el curso <strong>{course.name}</strong>? Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(course.id),
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>{isAdmin ? 'Gestión de cursos' : 'Mis cursos'}</Title>
        {isAdmin && (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Nuevo curso
          </Button>
        )}
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
              {isAdmin && <Table.Th>Docente</Table.Th>}
              <Table.Th w={isAdmin ? 140 : 60}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={isAdmin ? 3 : 2}>
                  <Text c="dimmed" ta="center" size="sm" py="md">
                    No hay cursos disponibles.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {courses?.map((course) => (
              <Table.Tr key={course.id}>
                <Table.Td>{course.name}</Table.Td>
                {isAdmin && (
                  <Table.Td>
                    {course.teacher ? (
                      <Badge variant="light" color="blue">
                        {course.teacher.name} {course.teacher.lastname}
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap="xs">
                    {isAdmin && (
                      <>
                        <Tooltip label="Asignar estudiantes">
                          <ActionIcon variant="subtle" color="teal" onClick={() => openAssign(course)}>
                            <IconUsers size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Editar">
                          <ActionIcon variant="subtle" onClick={() => openEdit(course)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => confirmDelete(course)}
                            loading={deleteMutation.isPending}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <CourseFormModal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        editCourse={editCourse}
      />

      <AssignStudentsModal
        opened={assignOpen}
        onClose={() => setAssignOpen(false)}
        course={assignCourse}
      />
    </Stack>
  );
}
