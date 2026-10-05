import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { errorMessage, isApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAuth } from '../auth-context';
import { AuthLayout } from '../components/auth-layout';
import { FormAlert } from '../components/form-alert';
import { PasswordChecklist } from '../components/password-checklist';
import { PasswordInput } from '../components/password-input';
import { signUpSchema, type SignUpValues } from '../schemas';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: { email: '', name: '', password: '' },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      toast.success(`Welcome aboard, ${values.name.trim()}!`);
      navigate('/app', { replace: true });
    } catch (e) {
      if (isApiError(e) && e.status === 409) {
        setError('email', { message: 'This email is already registered. Try signing in.' });
        return;
      }
      setError('root', { message: errorMessage(e) });
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have one?{' '}
          <Link to="/signin" className="font-semibold text-primary hover:underline">
            Sign in
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
        <FormField label="Name" error={errors.name?.message}>
          <Input autoComplete="name" placeholder="Jane Doe" {...register('name')} />
        </FormField>
        <FormField
          label="Password"
          error={errors.password?.message}
          hint={<PasswordChecklist value={password} />}
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
