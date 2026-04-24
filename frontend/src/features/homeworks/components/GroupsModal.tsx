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
  Loader,
  Center,
  SimpleGrid,
  Avatar,
  ThemeIcon,
  Alert,
  Title,
  ScrollArea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconUsers, IconUserOff, IconCheck, IconVideo } from '@tabler/icons-react';
import { Homework, User } from '@/types';
import { useGroups, useCreateGroup } from '@/features/homeworks/hooks/useHomeworks';
import { useCourseStudents } from '@/features/courses/hooks/useCourses';

interface Props {
  opened: boolean;
  onClose: () => void;
  homework: Homework | null;
}

function StudentAvatar({ student }: { student: User }) {
  return (
    <Group gap="xs">
      <Avatar color="blue" radius="xl" size="sm">
        {student.name[0].toUpperCase()}
      </Avatar>
      <div>
        <Text size="sm" fw={500}>{student.name} {student.lastname}</Text>
        <Text size="xs" c="dimmed">{student.email}</Text>
      </div>
    </Group>
  );
}

export function GroupsModal({ opened, onClose, homework }: Props) {
  const { data: groups, isLoading: loadingGroups } = useGroups(homework?.id ?? null);
  const { data: courseStudents, isLoading: loadingStudents } = useCourseStudents(
    homework?.courseId ?? null,
  );
  const createGroup = useCreateGroup(homework?.id ?? '');

  const [creatingGroup, setCreatingGroup] = useState(false);

  const form = useForm({
    initialValues: { name: '', studentIds: [] as string[] },
    validate: {
      name: (v) => (v.trim() ? null : 'Requerido'),
      studentIds: (v) => (v.length >= 1 ? null : 'Selecciona al menos 1 estudiante'),
    },
  });

  const assignedStudentIds = new Set(
    groups?.flatMap((g) => g.members.map((m) => m.studentId)) ?? [],
  );

  const unassignedStudents = courseStudents?.filter((s) => !assignedStudentIds.has(s.id)) ?? [];

  const availableOptions = unassignedStudents.map((s) => ({
    value: s.id,
    label: `${s.name} ${s.lastname}`,
  }));

  const handleCreateGroup = (values: typeof form.values) => {
    createGroup.mutate(values, {
      onSuccess: () => { form.reset(); setCreatingGroup(false); },
    });
  };

  const isLoading = loadingGroups || loadingStudents;
  const totalStudents = courseStudents?.length ?? 0;
  const assignedCount = assignedStudentIds.size;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Title order={5}>Grupos — {homework?.name}</Title>
          {!isLoading && (
            <Text size="xs" c="dimmed">
              {assignedCount} de {totalStudents} estudiantes asignados
            </Text>
          )}
        </Stack>
      }
      size="xl"
      scrollAreaComponent={ScrollArea}
    >
      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
          {/* Columna izquierda: grupos existentes */}
          <Stack gap="sm">
            <Text fw={600} size="sm">Grupos creados ({groups?.length ?? 0})</Text>

            {groups?.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No hay grupos creados aún.
              </Text>
            ) : (
              <Stack gap="sm">
                {groups?.map((g) => (
                  <Paper key={g.id} withBorder p="md" radius="md">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <ThemeIcon color="blue" variant="light" size="sm">
                            <IconUsers size={14} />
                          </ThemeIcon>
                          <Text fw={600} size="sm">{g.name}</Text>
                        </Group>
                        <Group gap="xs">
                          <Badge variant="light" color="blue" size="sm">
                            {g.members.length} miembro{g.members.length !== 1 ? 's' : ''}
                          </Badge>
                          {g.hasSubmission && (
                            <Badge
                              variant="filled"
                              color="green"
                              size="sm"
                              leftSection={<IconVideo size={10} />}
                            >
                              Entregó
                            </Badge>
                          )}
                        </Group>
                      </Group>
                      <Divider />
                      <Stack gap={6}>
                        {g.members.map((m) => (
                          <StudentAvatar key={m.id} student={m.student} />
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Botón agregar grupo */}
            {!creatingGroup && (
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreatingGroup(true)}
                disabled={unassignedStudents.length === 0}
                mt="xs"
              >
                Nuevo grupo
              </Button>
            )}
          </Stack>

          {/* Columna derecha: sin asignar + formulario */}
          <Stack gap="sm">
            {/* Estudiantes sin asignar */}
            <Text fw={600} size="sm">
              Sin asignar ({unassignedStudents.length})
            </Text>

            {unassignedStudents.length === 0 ? (
              <Paper withBorder p="md" radius="md" bg="green.0">
                <Group gap="xs">
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconCheck size={14} />
                  </ThemeIcon>
                  <Text size="sm" c="green.7" fw={500}>
                    Todos los estudiantes están asignados
                  </Text>
                </Group>
              </Paper>
            ) : (
              <Paper withBorder p="sm" radius="md">
                <Stack gap={8}>
                  {unassignedStudents.map((s) => (
                    <Group key={s.id} gap="xs">
                      <ThemeIcon color="orange" variant="light" size="sm">
                        <IconUserOff size={12} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm">{s.name} {s.lastname}</Text>
                        <Text size="xs" c="dimmed">{s.email}</Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Formulario nuevo grupo */}
            {creatingGroup && (
              <>
                <Divider label="Nuevo grupo" labelPosition="center" mt="xs" />
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
                        placeholder="Seleccionar estudiantes"
                        data={availableOptions}
                        searchable
                        hidePickedOptions
                        {...form.getInputProps('studentIds')}
                      />
                      {availableOptions.length === 0 && (
                        <Alert color="orange" p="xs">
                          No quedan estudiantes disponibles.
                        </Alert>
                      )}
                      <Group justify="flex-end" gap="xs">
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => { form.reset(); setCreatingGroup(false); }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          size="xs"
                          loading={createGroup.isPending}
                          disabled={availableOptions.length === 0}
                        >
                          Crear grupo
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Paper>
              </>
            )}
          </Stack>
        </SimpleGrid>
      )}
    </Modal>
  );
}
