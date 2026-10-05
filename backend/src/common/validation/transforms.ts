import type { TransformFnParams } from 'class-transformer';
import { normalizeEmail } from './auth-rules';

/** Non-strings pass through untouched so the type validators can reject them properly. */
export const trimString = ({ value }: TransformFnParams): unknown => {
  const v: unknown = value;
  return typeof v === 'string' ? v.trim() : v;
};

export const toNormalizedEmail = ({ value }: TransformFnParams): unknown => {
  const v: unknown = value;
  return typeof v === 'string' ? normalizeEmail(v) : v;
};
