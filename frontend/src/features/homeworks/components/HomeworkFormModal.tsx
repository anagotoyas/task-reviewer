import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useRubrics } from '@/features/rubrics/hooks/useRubrics';
import { useCreateHomework, useUpdateHomework } from '@/features/homeworks/hooks/useHomeworks';
import { Homework } from '@/types';

interface Props {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly editHomework?: Homework | null;
}

export function HomeworkFormModal({ opened, onClose, editHomework }: Props) {
  const { data: courses } = useCourses();
  const { data: rubrics } = useRubrics();
  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();

  const isEdit = !!editHomework;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      courseId: '',
      rubricId: '',
      isGroup: false,
      startDate: null as Date | null,
      endDate: null as Date | null,
      status: 'draft' as 'draft' | 'published' | 'closed',
    },
    validate: {
      name: (v) => (v.trim() ? null : 'Requerido'),
      description: (v) => (v.trim() ? null : 'Requerido'),
      courseId: (v) => (v ? null : 'Selecciona un curso'),
      rubricId: (v) => (v ? null : 'Selecciona una rúbrica'),
      startDate: (v) => (v ? null : 'Requerido'),
      endDate: (v, values) => {
        if (!v) return 'Requerido';
        if (values.startDate && v < values.startDate) return 'Debe ser posterior a la fecha de inicio';
        return null;
      },
    },
  });

  useEffect(() => {
    if (editHomework) {
      form.setValues({
        name: editHomework.name,
        description: editHomework.description,
        courseId: editHomework.courseId,
        rubricId: editHomework.rubricId,
        isGroup: editHomework.isGroup,
        startDate: new Date(editHomework.startDate),
        endDate: new Date(editHomework.endDate),
        status: editHomework.status,
      });
    } else {
      form.reset();
    }
  }, [editHomework, opened]);

  const courseOptions = courses?.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const rubricOptions = rubrics?.map((r) => ({ value: r.id, label: r.name })) ?? [];

  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicada' },
    { value: 'closed', label: 'Cerrada' },
  ];

  const handleSubmit = (values: typeof form.values) => {
    const payload = {
      name: values.name,
      description: values.description,
      courseId: values.courseId,
      rubricId: values.rubricId,
      isGroup: values.isGroup,
      startDate: values.startDate!.toISOString(),
      endDate: values.endDate!.toISOString(),
      status: values.status,
    };

    if (isEdit) {
      const { courseId, rubricId, ...updatePayload } = payload;
      updateMutation.mutate({ id: editHomework!.id, payload: updatePayload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Editar tarea' : 'Nueva tarea'}
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Nombre"
            placeholder="Ej: Presentación oral — Unidad 1"
            {...form.getInputProps('name')}
          />
          <Textarea
            label="Descripción"
            placeholder="Instrucciones para los estudiantes"
            rows={3}
            {...form.getInputProps('description')}
          />
          <Select
            label="Curso"
            placeholder="Seleccionar curso"
            data={courseOptions}
            searchable
            disabled={isEdit}
            {...form.getInputProps('courseId')}
          />
          <Select
            label="Rúbrica"
            placeholder="Seleccionar rúbrica"
            data={rubricOptions}
            searchable
            disabled={isEdit}
            {...form.getInputProps('rubricId')}
          />
          <Group grow>
            <DatePickerInput
              label="Fecha de inicio"
              placeholder="dd/mm/aaaa"
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('startDate')}
            />
            <DatePickerInput
              label="Fecha de cierre"
              placeholder="dd/mm/aaaa"
              valueFormat="DD/MM/YYYY"
              minDate={form.values.startDate ?? undefined}
              {...form.getInputProps('endDate')}
            />
          </Group>
          <Select
            label="Estado"
            data={statusOptions}
            {...form.getInputProps('status')}
          />
          <Switch
            label="Tarea grupal"
            disabled={isEdit}
            {...form.getInputProps('isGroup', { type: 'checkbox' })}
          />
          <Button type="submit" loading={isPending} mt="xs">
            {isEdit ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
