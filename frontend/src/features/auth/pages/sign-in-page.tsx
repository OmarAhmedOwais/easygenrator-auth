import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { errorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAuth } from '../auth-context';
import { AuthLayout } from '../components/auth-layout';
import { FormAlert } from '../components/form-alert';
import { PasswordInput } from '../components/password-input';
import { signInSchema, type SignInValues } from '../schemas';

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app';
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      navigate(from, { replace: true });
    } catch (e) {
      setError('root', { message: errorMessage(e) });
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormAlert message={errors.root?.message} />
        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            {...register('email')}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
