import { ApiProperty } from '@nestjs/swagger';
import type { PublicUser } from '../domain/user.js';

export class UserResponseDto implements PublicUser {
  @ApiProperty({ example: '6700f1c2a3b4c5d6e7f80910' }) id: string;
  @ApiProperty({ example: 'jane@example.com' }) email: string;
  @ApiProperty({ example: 'Jane Doe' }) name: string;
  @ApiProperty({ example: '2026-10-05T12:00:00.000Z' }) createdAt: Date;
}
