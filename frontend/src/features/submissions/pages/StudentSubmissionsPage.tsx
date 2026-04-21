import { useState } from 'react';
import {
  Title,
  Stack,
  Table,
  Text,
  Badge,
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Skeleton,
  Anchor,
  Tabs,
} from '@mantine/core';
import { IconUpload, IconBook, IconVideo, IconCheck } from '@tabler/icons-react';
import { useHomeworks } from '@/features/homeworks/hooks/useHomeworks';
import { useSubmissions } from '@/features/submissions/hooks/useSubmissions';
import { SubmitHomeworkModal } from '@/features/submissions/components/SubmitHomeworkModal';
import { RubricViewDrawer } from '@/features/submissions/components/RubricViewDrawer';
import { Homework, Submission } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const levelColor: Record<string, string> = {
  AD: 'violet',
  A: 'blue',
  B: 'yellow',
  C: 'red',
};

export function StudentSubmissionsPage() {
  const { data: homeworks, isLoading: loadingHw } = useHomeworks();
  const { data: submissions, isLoading: loadingSubs } = useSubmissions();

  const [submitHomework, setSubmitHomework] = useState<Homework | null>(null);
  const [rubricHomeworkId, setRubricHomeworkId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const submittedHomeworkIds = new Set(submissions?.map((s) => s.homeworkId) ?? []);

  const pendingHomeworks = homeworks?.filter((hw) => !submittedHomeworkIds.has(hw.id)) ?? [];
  const mySubmissions = submissions ?? [];

  const openRubric = (homeworkId: string) => {
    setRubricHomeworkId(homeworkId);
    setDrawerOpen(true);
  };

  return (
    <Stack gap="lg">
      <Title order={3}>Mis entregas</Title>

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab value="pending">
            Tareas pendientes{' '}
            {!loadingHw && <Badge size="xs" variant="light" ml={4}>{pendingHomeworks.length}</Badge>}
          </Tabs.Tab>
          <Tabs.Tab value="submitted">
            Entregadas{' '}
            {!loadingSubs && <Badge size="xs" variant="light" color="green" ml={4}>{mySubmissions.length}</Badge>}
          </Tabs.Tab>
        </Tabs.List>

        {/* TAB: tareas pendientes */}
        <Tabs.Panel value="pending" pt="md">
          {loadingHw ? (
            <Stack gap="xs">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={48} radius="sm" />)}
            </Stack>
          ) : pendingHomeworks.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="md">
              No tienes tareas pendientes de entrega.
            </Text>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tarea</Table.Th>
                  <Table.Th>Curso</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Cierre</Table.Th>
                  <Table.Th w={120}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingHomeworks.map((hw) => (
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
                      <Text size="sm">{formatDate(hw.endDate)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Ver rúbrica">
                          <ActionIcon
                            variant="subtle"
                            color="violet"
                            onClick={() => openRubric(hw.id)}
                          >
                            <IconBook size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Entregar">
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => setSubmitHomework(hw)}
                          >
                            <IconUpload size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        {/* TAB: entregas realizadas */}
        <Tabs.Panel value="submitted" pt="md">
          {loadingSubs ? (
            <Stack gap="xs">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={48} radius="sm" />)}
            </Stack>
          ) : mySubmissions.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="md">
              Aún no has realizado ninguna entrega.
            </Text>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tarea</Table.Th>
                  <Table.Th>Curso</Table.Th>
                  <Table.Th>Video</Table.Th>
                  <Table.Th>Entregado</Table.Th>
                  <Table.Th>Revisado</Table.Th>
                  <Table.Th>Resultado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mySubmissions.map((sub) => (
                  <Table.Tr key={sub.id}>
                    <Table.Td fw={500}>{sub.homework?.name ?? '—'}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{sub.homework?.course?.name ?? '—'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Anchor href={sub.videoUrl} target="_blank" size="sm">
                        <Group gap={4}>
                          <IconVideo size={14} />
                          Ver video
                        </Group>
                      </Anchor>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(sub.submittedAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {sub.teacherReviewed ? (
                        <Badge color="green" variant="light" size="sm" leftSection={<IconCheck size={10} />}>
                          Revisado
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light" size="sm">
                          Pendiente
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {sub.teacherReviewed && sub.evaluations && sub.evaluations.length > 0 ? (
                        <Group gap={4}>
                          {sub.evaluations.map((ev) => (
                            <Tooltip key={ev.id} label={ev.criterion?.name ?? ''}>
                              <Badge color={levelColor[ev.finalLevel]} variant="filled" size="sm">
                                {ev.finalLevel}
                              </Badge>
                            </Tooltip>
                          ))}
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>

      <SubmitHomeworkModal
        opened={!!submitHomework}
        onClose={() => setSubmitHomework(null)}
        homework={submitHomework}
      />

      <RubricViewDrawer
        homeworkId={rubricHomeworkId}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Stack>
  );
}
