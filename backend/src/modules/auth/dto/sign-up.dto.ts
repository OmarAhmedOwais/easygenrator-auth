import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../common/validation/auth-rules';
import { toNormalizedEmail, trimString } from '../../../common/validation/transforms';
import { IsStrongPassword } from '../../../common/validation/is-strong-password.decorator';

export class SignUpDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(toNormalizedEmail)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Jane Doe', minLength: NAME_MIN_LENGTH, maxLength: NAME_MAX_LENGTH })
  @Transform(trimString)
  @IsString()
  @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH, {
    message: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`,
  })
  name: string;

  @ApiProperty({
    example: 'Passw0rd!',
    minLength: 8,
    maxLength: PASSWORD_MAX_LENGTH,
    description: 'Min 8 chars, at least one letter, one number and one special character',
  })
  @IsString()
  @IsStrongPassword()
  password: string;
}
