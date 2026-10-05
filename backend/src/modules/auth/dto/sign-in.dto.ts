import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '../../../common/validation/auth-rules';
import { toNormalizedEmail } from '../../../common/validation/transforms';

/**
 * Sign-in deliberately does NOT re-apply the strength policy: the only question here is "does it
 * match the stored hash", and the policy may change after accounts were created.
 */
export class SignInDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(toNormalizedEmail)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
