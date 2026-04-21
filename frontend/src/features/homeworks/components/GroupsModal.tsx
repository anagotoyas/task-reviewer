import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  TextInput,
  MultiSelect,
  Divider,
  Paper,
  Badge,
  ActionIcon,
  Accordion,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Homework } from '@/types';
import { useGroups, useCreateGroup } from '@/features/homeworks/hooks/useHomeworks';
import { useCourseStudents } from '@/features/courses/hooks/useCourses';

interface Props {
  opened: boolean;
  onClose: () => void;
  homework: Homework | null;
}

export function GroupsModal({ opened, onClose, homework }: Props) {
  const { data: groups, isLoading: loadingGroups } = useGroups(homework?.id ?? null);
  const { data: courseStudents, isLoading: loadingStudents } = useCourseStudents(
    homework?.courseId ?? null,
  );
  const createGroup = useCreateGroup(homework?.id ?? '');

  const [creatingGroup, setCreatingGroup] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      studentIds: [] as string[],
    },
    validate: {
      name: (v) => (v.trim() ? null : 'Requerido'),
      studentIds: (v) => (v.length >= 2 ? null : 'Mínimo 2 estudiantes por grupo'),
    },
  });

  // IDs ya asignados a algún grupo
  const assignedStudentIds = new Set(
    groups?.flatMap((g) => g.members.map((m) => m.studentId)) ?? [],
  );

  const availableStudents =
    courseStudents
      ?.filter((s) => !assignedStudentIds.has(s.id))
      .map((s) => ({
        value: s.id,
        label: `${s.name} ${s.lastname}`,
      })) ?? [];

  const handleCreateGroup = (values: typeof form.values) => {
    createGroup.mutate(values, {
      onSuccess: () => {
        form.reset();
        setCreatingGroup(false);
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Text fw={600}>Grupos — {homework?.name}</Text>
          <Text size="xs" c="dimmed">Tarea grupal</Text>
        </Stack>
      }
      centered
      size="lg"
    >
      <Stack gap="md">
        {/* Lista de grupos existentes */}
        {loadingGroups ? (
          <Center py="md"><Loader size="sm" /></Center>
        ) : groups?.length === 0 && !creatingGroup ? (
          <Text size="sm" c="dimmed" ta="center" py="xs">
            No hay grupos creados aún.
          </Text>
        ) : (
          <Accordion variant="separated" radius="md">
            {groups?.map((g) => (
              <Accordion.Item key={g.id} value={g.id}>
                <Accordion.Control>
                  <Group justify="space-between" pr="sm">
                    <Text fw={500}>{g.name}</Text>
                    <Badge variant="light" color="blue" size="sm">
                      {g.members.length} miembro{g.members.length !== 1 ? 's' : ''}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {g.members.map((m) => (
                      <Group key={m.id} gap="xs">
                        <Text size="sm">
                          {m.student.name} {m.student.lastname}
                        </Text>
                        <Text size="xs" c="dimmed">— {m.student.email}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}

        {/* Formulario nuevo grupo */}
        {creatingGroup ? (
          <>
            <Divider label="Nuevo grupo" labelPosition="center" />
            <Paper withBorder p="md" radius="md">
              <form onSubmit={form.onSubmit(handleCreateGroup)}>
                <Stack gap="sm">
                  <TextInput
                    label="Nombre del grupo"
                    placeholder="Ej: Grupo A"
                    {...form.getInputProps('name')}
                  />
                  <MultiSelect
                    label="Estudiantes"
                    placeholder={
                      loadingStudents
                        ? 'Cargando...'
                        : availableStudents.length === 0
                        ? 'No hay estudiantes disponibles'
                        : 'Seleccionar estudiantes'
                    }
                    data={availableStudents}
                    searchable
                    hidePickedOptions
                    disabled={loadingStudents || availableStudents.length === 0}
                    {...form.getInputProps('studentIds')}
                  />
                  {availableStudents.length === 0 && !loadingStudents && (
                    <Text size="xs" c="dimmed">
                      Todos los estudiantes del curso ya están asignados a un grupo.
                    </Text>
                  )}
                  <Group justify="flex-end">
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => { form.reset(); setCreatingGroup(false); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="xs"
                      loading={createGroup.isPending}
                      disabled={availableStudents.length === 0}
                    >
                      Crear grupo
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </>
        ) : (
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreatingGroup(true)}
            disabled={availableStudents.length === 0 && !loadingStudents}
          >
            Agregar grupo
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
