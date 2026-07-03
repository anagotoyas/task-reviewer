import { useState } from 'react';
import {
  Title,
  Button,
  Group,
  ActionIcon,
  Text,
  Stack,
  Skeleton,
  Tooltip,
  Badge,
  SimpleGrid,
  Card,
  ThemeIcon,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUsers,
  IconBook,
  IconSchool,
  IconAtom,
  IconMath,
  IconMicroscope,
  IconGlobe,
  IconPalette,
  IconMusic,
  IconDeviceDesktop,
  IconLeaf,
} from '@tabler/icons-react';
import { useCourses, useDeleteCourse } from '@/features/courses/hooks/useCourses';
import { CourseFormModal } from '@/features/courses/components/CourseFormModal';
import { AssignStudentsModal } from '@/features/courses/components/AssignStudentsModal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Course } from '@/types';

const COLORS = ['blue', 'teal', 'violet', 'orange', 'pink', 'cyan', 'grape', 'green', 'red', 'indigo'];
const ICONS = [IconBook, IconSchool, IconAtom, IconMath, IconMicroscope, IconGlobe, IconPalette, IconMusic, IconDeviceDesktop, IconLeaf];

function hashIndex(str: string, len: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % len;
}

export function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const deleteMutation = useDeleteCourse();
  const { user } = useAuthStore();
  const isAdmin = user?.role.name === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [assignCourse, setAssignCourse] = useState<Course | null>(null);

  const openCreate = () => { setEditCourse(null); setFormOpen(true); };
  const openEdit = (course: Course) => { setEditCourse(course); setFormOpen(true); };
  const openAssign = (course: Course) => { setAssignCourse(course); setAssignOpen(true); };

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

      {isLoading && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} height={200} radius="md" />
          ))}
        </SimpleGrid>
      )}
      {!isLoading && courses?.length === 0 && (
        <Text c="dimmed" size="sm" ta="center" py="xl">
          No hay cursos disponibles.
        </Text>
      )}
      {!isLoading && (courses?.length ?? 0) > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {courses?.map((course) => {
            const color = COLORS[hashIndex(course.id, COLORS.length)];
            const Icon = ICONS[hashIndex(course.id + '1', ICONS.length)];
            return (
              <Card key={course.id} withBorder radius="md" padding="lg">
                <Stack align="center" gap="md">
                  <ThemeIcon color={color} variant="light" size={72} radius="xl">
                    <Icon size={40} />
                  </ThemeIcon>

                  <Text fw={700} size="lg" ta="center" lineClamp={2}>{course.name}</Text>

                  {isAdmin && course.teacher && (
                    <Badge variant="light" color={color} size="sm">
                      {course.teacher.name} {course.teacher.lastname}
                    </Badge>
                  )}

                  {isAdmin && (
                    <Group gap="xs" justify="center">
                      <Tooltip label="Asignar estudiantes">
                        <ActionIcon variant="light" color="teal" onClick={() => openAssign(course)}>
                          <IconUsers size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <ActionIcon variant="light" color="blue" onClick={() => openEdit(course)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Eliminar">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => confirmDelete(course)}
                          loading={deleteMutation.isPending}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
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
