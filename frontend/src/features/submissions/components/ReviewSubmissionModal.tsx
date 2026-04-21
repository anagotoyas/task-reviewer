import { useEffect, useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Select,
  Textarea,
  Button,
  Divider,
  Alert,
  Loader,
  Center,
  Paper,
  Title,
  SimpleGrid,
  AspectRatio,
} from '@mantine/core';
import { IconRobot, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { useSubmission, useStartReview, useReviewSubmission, useRetryAi } from '../hooks/useSubmissions';
import { PerformanceLevel, RubricCriterion } from '@/types';
import { CriterionEvaluationPayload } from '../api/submissions.api';

interface Props {
  submissionId: string | null;
  opened: boolean;
  onClose: () => void;
}

const levelColor: Record<string, string> = { AD: 'violet', A: 'blue', B: 'yellow', C: 'red' };
const levelOptions = [
  { value: 'AD', label: 'AD - Logro destacado' },
  { value: 'A', label: 'A - Logro esperado' },
  { value: 'B', label: 'B - En proceso' },
  { value: 'C', label: 'C - En inicio' },
];

interface EvalState {
  criterionId: string;
  finalLevel: PerformanceLevel;
  finalReasoning: string;
  editedByTeacher: boolean;
}

export function ReviewSubmissionModal({ submissionId, opened, onClose }: Props) {
  const { data: submission, isLoading } = useSubmission(submissionId);
  const startReview = useStartReview(submissionId ?? '');
  const reviewMutation = useReviewSubmission(submissionId ?? '');
  const retryAi = useRetryAi(submissionId ?? '');

  const [evals, setEvals] = useState<EvalState[]>([]);
  const [started, setStarted] = useState(false);

  const criteria: RubricCriterion[] = submission?.homework?.rubric?.criteria ?? [];

  useEffect(() => {
    if (!submission || criteria.length === 0) return;

    setEvals(
      criteria.map((c) => {
        const existing = submission.evaluations?.find((e) => e.criterionId === c.id);
        const teacherAlreadyReviewed = submission.teacherReviewed || existing?.editedByTeacher;
        return {
          criterionId: c.id,
          finalLevel: teacherAlreadyReviewed
            ? (existing?.finalLevel ?? existing?.aiLevel ?? 'A')
            : (existing?.aiLevel ?? existing?.finalLevel ?? 'A'),
          finalReasoning: teacherAlreadyReviewed
            ? (existing?.finalReasoning ?? existing?.aiReasoning ?? '')
            : (existing?.aiReasoning ?? existing?.finalReasoning ?? ''),
          editedByTeacher: existing?.editedByTeacher ?? false,
        };
      }),
    );

    if (submission.reviewStartedAt) setStarted(true);
  }, [submission?.id, submission?.aiEvaluatedAt, criteria.length]);

  function handleStart() {
    startReview.mutate(undefined, {
      onSuccess: () => setStarted(true),
    });
  }

  function updateEval(criterionId: string, field: 'finalLevel' | 'finalReasoning', value: string) {
    setEvals((prev) =>
      prev.map((e) =>
        e.criterionId === criterionId
          ? { ...e, [field]: value, editedByTeacher: true }
          : e,
      ),
    );
  }

  function handleSubmit() {
    const payload: CriterionEvaluationPayload[] = evals.map((e) => ({
      criterionId: e.criterionId,
      finalLevel: e.finalLevel,
      finalReasoning: e.finalReasoning,
      editedByTeacher: e.editedByTeacher,
    }));
    reviewMutation.mutate({ evaluations: payload }, { onSuccess: onClose });
  }

  const student = submission?.student
    ? `${submission.student.name} ${submission.student.lastname}`
    : submission?.group?.name ?? '—';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={5}>Revisar entrega</Title>}
      size="100%"
      styles={{ body: { padding: '1rem' }, content: { maxWidth: '1400px', margin: '0 auto' } }}
      scrollAreaComponent={Modal.NativeScrollArea}
    >
      {isLoading || !submission ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
          {/* Left: video */}
          <Stack gap="sm">
            <div>
              <Text fw={600} size="lg">{submission.homework?.name}</Text>
              <Text size="sm" c="dimmed">{submission.homework?.course?.name} · {student}</Text>
            </div>
            <AspectRatio ratio={16 / 9}>
              <video
                src={submission.videoUrl}
                controls
                style={{ width: '100%', height: '100%', borderRadius: 8, background: '#000' }}
              />
            </AspectRatio>

            {!submission.aiEvaluatedAt && (
              <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Sin evaluación IA">
                La IA aún no evaluó esta entrega.
              </Alert>
            )}

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {submission.aiEvaluatedAt
                  ? `IA evaluó: ${new Date(submission.aiEvaluatedAt).toLocaleString('es-PE')}`
                  : 'IA pendiente'}
              </Text>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconRobot size={14} />}
                rightSection={<IconRefresh size={14} />}
                loading={retryAi.isPending}
                onClick={() => retryAi.mutate()}
              >
                Re-evaluar con IA
              </Button>
            </Group>
          </Stack>

          {/* Right: rubric criteria */}
          <Stack gap="md">
            <Divider label="Evaluación por criterio" labelPosition="center" />

            {!started ? (
              <Button onClick={handleStart} loading={startReview.isPending} fullWidth>
                Iniciar revisión
              </Button>
            ) : (
              <>
                <Stack gap="md" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                  {criteria.map((c) => {
                    const ev = evals.find((e) => e.criterionId === c.id);
                    const aiEval = submission.evaluations?.find((e) => e.criterionId === c.id);
                    if (!ev) return null;
                    return (
                      <Paper key={c.id} withBorder p="md" radius="md">
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={600} size="sm">{c.name}</Text>
                            {aiEval?.aiLevel && (
                              <Group gap={4}>
                                <IconRobot size={14} />
                                <Badge color={levelColor[aiEval.aiLevel]} variant="light" size="sm">
                                  IA: {aiEval.aiLevel}
                                </Badge>
                              </Group>
                            )}
                          </Group>

                          {aiEval?.aiReasoning && (
                            <Text size="xs" c="dimmed" fs="italic">
                              IA: {aiEval.aiReasoning}
                            </Text>
                          )}

                          <Select
                            label="Nivel final"
                            data={levelOptions}
                            value={ev.finalLevel}
                            onChange={(v) => v && updateEval(c.id, 'finalLevel', v)}
                            size="sm"
                          />
                          <Textarea
                            label="Justificación final"
                            value={ev.finalReasoning}
                            onChange={(e) => updateEval(c.id, 'finalReasoning', e.currentTarget.value)}
                            minRows={2}
                            size="sm"
                          />
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>

                <Button
                  fullWidth
                  onClick={handleSubmit}
                  loading={reviewMutation.isPending}
                  disabled={evals.some((e) => !e.finalReasoning.trim())}
                >
                  Publicar revisión
                </Button>
              </>
            )}
          </Stack>
        </SimpleGrid>
      )}
    </Modal>
  );
}
