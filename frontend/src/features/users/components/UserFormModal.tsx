import { useEffect } from 'react';
import { Modal, TextInput, PasswordInput, Select, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRoles, useCreateUser, useUpdateUser } from '@/features/users/hooks/useUsers';
import { User } from '@/types';

interface Props {
  opened: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export function UserFormModal({ opened, onClose, editUser }: Props) {
  const { data: roles } = useRoles();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEdit = !!editUser;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    initialValues: {
      name: '',
      lastname: '',
      email: '',
      password: '',
      roleId: '',
    },
    validate: {
      name: (v) => (v.trim() ? null : 'Requerido'),
      lastname: (v) => (v.trim() ? null : 'Requerido'),
      email: (v) => (/^\S+@\S+/.test(v) ? null : 'Email inválido'),
      password: (v) => (!isEdit && v.length < 6 ? 'Mínimo 6 caracteres' : null),
      roleId: (v) => (v ? null : 'Selecciona un rol'),
    },
  });

  useEffect(() => {
    if (editUser) {
      form.setValues({
        name: editUser.name,
        lastname: editUser.lastname,
        email: editUser.email,
        password: '',
        roleId: editUser.role.id,
      });
    } else {
      form.reset();
    }
  }, [editUser, opened]);

  const roleDisplayName: Record<string, string> = { admin: 'Admin', teacher: 'Docente', student: 'Estudiante' };
  const roleOptions =
    roles?.map((r) => ({ value: r.id, label: roleDisplayName[r.name] ?? r.name })) ?? [];

  const handleSubmit = (values: typeof form.values) => {
    if (isEdit) {
      const payload: Record<string, string> = {};
      if (values.name !== editUser!.name) payload.name = values.name;
      if (values.lastname !== editUser!.lastname) payload.lastname = values.lastname;
      if (values.email !== editUser!.email) payload.email = values.email;
      if (values.roleId !== editUser!.role.id) payload.roleId = values.roleId;
      if (values.password) payload.password = values.password;
      updateMutation.mutate(
        { id: editUser!.id, payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(values, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput label="Nombre" placeholder="Juan" {...form.getInputProps('name')} />
          <TextInput label="Apellido" placeholder="Pérez" {...form.getInputProps('lastname')} />
          <TextInput label="Correo" placeholder="correo@ejemplo.com" {...form.getInputProps('email')} />
          <PasswordInput
            label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            placeholder="••••••••"
            {...form.getInputProps('password')}
          />
          <Select
            label="Rol"
            placeholder="Seleccionar rol"
            data={roleOptions}
            {...form.getInputProps('roleId')}
          />
          <Button type="submit" loading={isPending} mt="xs">
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
