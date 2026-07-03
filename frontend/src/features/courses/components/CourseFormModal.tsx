import { useEffect } from 'react';
import { Modal, TextInput, Select, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTeachers, useCreateCourse, useUpdateCourse } from '@/features/courses/hooks/useCourses';
import { Course } from '@/types';

interface Props {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly editCourse?: Course | null;
}

export function CourseFormModal({ opened, onClose, editCourse }: Props) {
  const { data: teachers } = useTeachers();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const isEdit = !!editCourse;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    initialValues: {
      name: '',
      teacherId: '',
    },
    validate: {
      name: (v) => (v.trim() ? null : 'Requerido'),
      teacherId: (v) => (v ? null : 'Selecciona un docente'),
    },
  });

  useEffect(() => {
    if (editCourse) {
      form.setValues({
        name: editCourse.name,
        teacherId: editCourse.teacherId,
      });
    } else {
      form.reset();
    }
  }, [editCourse, opened]);

  const teacherOptions =
    teachers?.map((t) => ({
      value: t.id,
      label: `${t.name} ${t.lastname}`,
    })) ?? [];

  const handleSubmit = (values: typeof form.values) => {
    if (isEdit) {
      const payload: Record<string, string> = {};
      if (values.name !== editCourse!.name) payload.name = values.name;
      if (values.teacherId !== editCourse!.teacherId) payload.teacherId = values.teacherId;
      updateMutation.mutate({ id: editCourse!.id, payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(values, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Editar curso' : 'Nuevo curso'}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Nombre del curso"
            placeholder="Ej: Matemáticas 5to A"
            {...form.getInputProps('name')}
          />
          <Select
            label="Docente"
            placeholder="Seleccionar docente"
            data={teacherOptions}
            searchable
            {...form.getInputProps('teacherId')}
          />
          <Button type="submit" loading={isPending} mt="xs">
            {isEdit ? 'Guardar cambios' : 'Crear curso'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
