import { registerDecorator, type ValidationOptions } from 'class-validator';
import { isStrongPassword, PASSWORD_RULES_MESSAGE } from './auth-rules';

/** class-validator decorator for the spec's password policy. */
export function IsStrongPassword(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isStrongPassword',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: PASSWORD_RULES_MESSAGE, ...options },
      validator: { validate: (value: unknown) => isStrongPassword(value) },
    });
  };
}
