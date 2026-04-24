import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Anchor,
  Skeleton,
  Tooltip,
  Button,
  Table,
  Title,
  Center,
} from '@mantine/core';
import { IconVideo, IconCheck, IconClock, IconEdit, IconRobot } from '@tabler/icons-react';
import { useSubmissionsByHomework } from '@/features/submissions/hooks/useSubmissions';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import { Homework } from '@/types';

interface Props {
  homework: Homework | null;
  opened: boolean;
  onClose: () => void;
}

const levelColor: Record<string, string> = {
  AD: 'violet',
  A: 'blue',
  B: 'yellow',
  C: 'red',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function HomeworkSubmissionsModal({ homework, opened, onClose }: Props) {
  const { data: submissions, isLoading } = useSubmissionsByHomework(homework?.id ?? null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  return (
    <>
      <Modal
        opened={opened && !reviewId}
        onClose={onClose}
        title={
          <Stack gap={2}>
            <Title order={5}>Entregas — {homework?.name}</Title>
            <Text size="xs" c="dimmed">{homework?.course?.name}</Text>
          </Stack>
        }
        size="90%"
        styles={{ content: { maxWidth: 1100, margin: '0 auto' } }}
        scrollAreaComponent={Modal.NativeScrollArea}
      >
        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={48} radius="sm" />
            ))}
          </Stack>
        ) : submissions?.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" size="sm">No hay entregas para esta tarea aún.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Alumno / Grupo</Table.Th>
                <Table.Th>Video</Table.Th>
                <Table.Th>Entregado</Table.Th>
                <Table.Th>IA</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Niveles</Table.Th>
                <Table.Th>Acción</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissions?.map((sub) => (
                <Table.Tr key={sub.id}>
                  <Table.Td>
                    {sub.groupId ? (
                      <div>
                        <Badge variant="light" color="teal" size="sm">{sub.group?.name ?? 'Grupo'}</Badge>
                        <Text size="xs" c="dimmed" mt={2}>
                          {sub.group?.members?.map((m) => `${m.student.name} ${m.student.lastname}`).join(', ')}
                        </Text>
                      </div>
                    ) : (
                      <Text size="sm">
                        {sub.student ? `${sub.student.name} ${sub.student.lastname}` : '—'}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Anchor href={sub.videoUrl} target="_blank" size="sm">
                      <Group gap={4}>
                        <IconVideo size={14} />
                        Ver
                      </Group>
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(sub.submittedAt)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {sub.aiEvaluatedAt ? (
                      <Tooltip label={`Evaluado: ${new Date(sub.aiEvaluatedAt).toLocaleString('es-PE')}`}>
                        <Badge color="blue" variant="light" size="sm" leftSection={<IconRobot size={10} />}>
                          Listo
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Badge color="gray" variant="light" size="sm" leftSection={<IconClock size={10} />}>
                        Pendiente
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {sub.teacherReviewed ? (
                      <Badge color="green" variant="light" size="sm" leftSection={<IconCheck size={10} />}>
                        Revisado
                      </Badge>
                    ) : (
                      <Badge color="orange" variant="light" size="sm" leftSection={<IconClock size={10} />}>
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
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      color={sub.teacherReviewed ? 'gray' : 'blue'}
                      leftSection={<IconEdit size={14} />}
                      onClick={() => setReviewId(sub.id)}
                    >
                      {sub.teacherReviewed ? 'Ver/Editar' : 'Revisar'}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Modal>

      <ReviewSubmissionModal
        submissionId={reviewId}
        opened={!!reviewId}
        onClose={() => setReviewId(null)}
      />
    </>
  );
}
