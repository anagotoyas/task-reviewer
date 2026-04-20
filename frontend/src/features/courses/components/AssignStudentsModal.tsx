import { useEffect, useState } from 'react';
import { Modal, MultiSelect, Button, Stack, Text } from '@mantine/core';
import { useStudents, useAssignStudents } from '@/features/courses/hooks/useCourses';
import { Course } from '@/types';

interface Props {
  opened: boolean;
  onClose: () => void;
  course: Course | null;
}

export function AssignStudentsModal({ opened, onClose, course }: Props) {
  const { data: students } = useStudents();
  const assignMutation = useAssignStudents();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!opened) setSelected([]);
  }, [opened]);

  const studentOptions =
    students?.map((s) => ({
      value: s.id,
      label: `${s.name} ${s.lastname} — ${s.email}`,
    })) ?? [];

  const handleSubmit = () => {
    if (!course || selected.length === 0) return;
    assignMutation.mutate(
      { courseId: course.id, payload: { studentIds: selected } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Asignar estudiantes — ${course?.name ?? ''}`}
      centered
      size="md"
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Selecciona los estudiantes a inscribir. Si ya están inscritos, se reactivará su matrícula.
        </Text>
        <MultiSelect
          label="Estudiantes"
          placeholder="Buscar estudiante..."
          data={studentOptions}
          value={selected}
          onChange={setSelected}
          searchable
          hidePickedOptions
        />
        <Button
          onClick={handleSubmit}
          loading={assignMutation.isPending}
          disabled={selected.length === 0}
          mt="xs"
        >
          Asignar ({selected.length})
        </Button>
      </Stack>
    </Modal>
  );
}
