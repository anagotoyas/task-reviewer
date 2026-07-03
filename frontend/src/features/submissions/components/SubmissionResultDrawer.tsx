import {
  Drawer,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  Loader,
  Center,
  Paper,
  Title,
  Anchor,
  ThemeIcon,
} from '@mantine/core';
import { IconVideo, IconCheck } from '@tabler/icons-react';
import { useSubmission } from '../hooks/useSubmissions';
import { PerformanceLevel } from '@/types';

interface Props {
  readonly submissionId: string | null;
  readonly opened: boolean;
  readonly onClose: () => void;
}

const levelColor: Record<string, string> = {
  AD: 'violet',
  A: 'blue',
  B: 'yellow',
  C: 'red',
};

const levelLabel: Record<PerformanceLevel, string> = {
  AD: 'Logro destacado',
  A: 'Logro esperado',
  B: 'En proceso',
  C: 'En inicio',
};

export function SubmissionResultDrawer({ submissionId, opened, onClose }: Props) {
  const { data: submission, isLoading } = useSubmission(submissionId);

  const evaluations = submission?.evaluations ?? [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={5}>Resultado de la entrega</Title>}
      position="right"
      size="lg"
      padding="lg"
    >
      {isLoading || !submission ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <Stack gap="md">
          <div>
            <Text fw={600} size="lg">{submission.homework?.name}</Text>
            <Text size="sm" c="dimmed">{submission.homework?.course?.name}</Text>
          </div>

          <Anchor href={submission.videoUrl} target="_blank" size="sm">
            <Group gap={4}>
              <IconVideo size={14} />
              Ver mi video
            </Group>
          </Anchor>

          <Divider />

          {evaluations.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="md">
              El docente aún no ha publicado la calificación.
            </Text>
          ) : (
            <Stack gap="sm">
              {evaluations.map((ev) => (
                <Paper key={ev.id} withBorder p="md" radius="md">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Text fw={600} size="sm" style={{ flex: 1 }}>
                        {ev.criterion?.name ?? '—'}
                      </Text>
                      <Badge
                        color={levelColor[ev.finalLevel]}
                        variant="filled"
                        size="md"
                        style={{ minWidth: 40, textAlign: 'center' }}
                      >
                        {ev.finalLevel}
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {levelLabel[ev.finalLevel]}
                    </Text>

                    <Text size="sm">{ev.finalReasoning}</Text>
                  </Stack>
                </Paper>
              ))}

              <Paper withBorder p="md" radius="md" bg="green.0">
                <Group gap="xs">
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconCheck size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500} c="green.8">
                    Calificación publicada por el docente
                  </Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
