import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Stack,
  Button,
  Text,
  Alert,
  Group,
  Progress,
  Paper,
  ActionIcon,
  ThemeIcon,
  Badge,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconVideo,
  IconX,
  IconUpload,
  IconCheck,
  IconUsers,
  IconAlertCircle,
} from '@tabler/icons-react';
import { Homework } from '@/types';
import { useGroups } from '@/features/homeworks/hooks/useHomeworks';
import { useCreateSubmission } from '@/features/submissions/hooks/useSubmissions';
import { uploadVideo } from '@/features/submissions/api/submissions.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getApiErrorMessage } from '@/lib/utils';
import { notifications } from '@mantine/notifications';

interface Props {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly homework: Homework | null;
}

export function SubmitHomeworkModal({ opened, onClose, homework }: Props) {
  const { user } = useAuthStore();
  const { data: groups, isLoading: loadingGroups } = useGroups(
    homework?.isGroup ? (homework?.id ?? null) : null,
  );
  const createMutation = useCreateSubmission();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      setVideoFile(null);
      setUploadProgress(0);
      setUploading(false);
    }
  }, [opened]);

  // Find the student's group automatically
  const myGroup = homework?.isGroup
    ? groups?.find((g) => g.members.some((m) => m.studentId === user?.id))
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      notifications.show({ color: 'red', message: 'Solo se permiten archivos de video' });
      return;
    }
    setVideoFile(file);
  };

  const handleSubmit = async () => {
    if (!homework || !videoFile) return;
    if (homework.isGroup && !myGroup) return;

    try {
      setUploading(true);
      const videoUrl = await uploadVideo(videoFile, setUploadProgress);
      createMutation.mutate(
        {
          homeworkId: homework.id,
          videoUrl,
          groupId: homework.isGroup ? myGroup!.id : undefined,
        },
        { onSuccess: onClose },
      );
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Error al subir el video',
        message: getApiErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  const isPending = uploading || createMutation.isPending;
  const canSubmit = !!videoFile && (!homework?.isGroup || !!myGroup);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Entregar: ${homework?.name ?? ''}`}
      centered
      size="md"
      closeOnClickOutside={!isPending}
      closeOnEscape={!isPending}
    >
      <Stack gap="sm">
        {homework?.description && (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            {homework.description}
          </Alert>
        )}

        {/* Grupo detectado automáticamente */}
        {homework?.isGroup && (
          <>
            {loadingGroups && <Center py="xs"><Loader size="sm" /></Center>}
            {!loadingGroups && myGroup && (
              <Paper withBorder p="sm" radius="md" bg="blue.0">
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="sm">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={600}>{myGroup.name}</Text>
                    <Text size="xs" c="dimmed">
                      {myGroup.members.map((m) => `${m.student.name} ${m.student.lastname}`).join(' · ')}
                    </Text>
                  </div>
                  <Badge variant="light" color="blue" size="sm" ml="auto">
                    Tu grupo
                  </Badge>
                </Group>
              </Paper>
            )}
            {!loadingGroups && !myGroup && (
              <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Sin grupo asignado">
                No estás asignado a ningún grupo para esta tarea. Contacta a tu docente.
              </Alert>
            )}
          </>
        )}

        {/* File picker — solo mostrar si puede entregar */}
        {(!homework?.isGroup || myGroup) && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {videoFile ? (
              <Paper withBorder p="md" radius="md">
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="blue">
                      <IconVideo size={16} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 280 }}>
                        {videoFile.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </Text>
                    </Stack>
                  </Group>
                  {!isPending && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => { setVideoFile(null); setUploadProgress(0); }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  )}
                </Group>

                {uploading && (
                  <Stack gap={4} mt="sm">
                    <Progress value={uploadProgress} animated size="sm" />
                    <Text size="xs" c="dimmed" ta="right">{uploadProgress}%</Text>
                  </Stack>
                )}

                {createMutation.isSuccess && (
                  <Group gap={6} mt="sm">
                    <IconCheck size={14} color="green" />
                    <Text size="xs" c="green">Video subido correctamente</Text>
                  </Group>
                )}
              </Paper>
            ) : (
              <Paper
                withBorder
                p="xl"
                radius="md"
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                onClick={() => inputRef.current?.click()}
              >
                <Stack align="center" gap="xs">
                  <ThemeIcon size="xl" variant="light" color="blue">
                    <IconUpload size={24} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Haz clic para seleccionar tu video</Text>
                  <Text size="xs" c="dimmed">MP4, MOV, AVI, MKV — máx. 50 MB</Text>
                </Stack>
              </Paper>
            )}

            <Button
              onClick={handleSubmit}
              loading={isPending}
              disabled={!canSubmit}
              mt="xs"
            >
              {uploading ? `Subiendo... ${uploadProgress}%` : 'Enviar entrega'}
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
