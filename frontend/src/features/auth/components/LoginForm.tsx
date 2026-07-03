import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Paper, Center } from '@mantine/core';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { IconBrandYoutube } from '@tabler/icons-react';

import picture from '@/assets/login.png';
import classes from './LoginForm.module.css';

export function LoginForm() {
  const { mutate: doLogin, isPending } = useLogin();

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+/.test(v) ? null : 'Email inválido'),
      password: (v) => (v.length >= 6 ? null : 'Mínimo 6 caracteres'),
    },
  });

  return (
    <div className={classes.container}>
      <div className={classes.imageWrapper}>
        <img src={picture} alt="Login" />
      </div>
      <Center className={classes.wrapper}>
        <Paper className={classes.card} shadow="md" withBorder>
          <Stack gap="lg">
            <Stack gap="xs">
              <Title order={2} ta="center" size="xxs" styles={{ root: { fontWeight: 400 } }}>Bienvenido a </Title>
              <div className={classes.brand}>
                <IconBrandYoutube size="2rem" />
                <Title order={2} ta="center">Task Reviewer</Title>
              </div>

              <Text c="dimmed" size="sm" ta="center">Plataforma educativa de evaluación</Text>
            </Stack>

            <form onSubmit={form.onSubmit((values) => doLogin(values))}>
              <Stack gap="md">
                <TextInput
                  label="Correo electrónico"
                  placeholder="correo@ejemplo.com"
                  {...form.getInputProps('email')}
                />
                <PasswordInput
                  label="Contraseña"
                  placeholder="••••••••"
                  {...form.getInputProps('password')}
                />
                <Button type="submit" fullWidth loading={isPending} mt="xs" >
                  Ingresar
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Center>

    </div >
  );
}
