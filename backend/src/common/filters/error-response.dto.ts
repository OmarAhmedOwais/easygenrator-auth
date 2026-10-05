import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ErrorBody } from './all-exceptions.filter.js';

export class ErrorResponseDto implements ErrorBody {
  @ApiProperty({ example: 400 }) statusCode: number;
  @ApiProperty({ example: 'Bad Request' }) error: string;
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: ['email must be an email'],
  })
  message: string | string[];
  @ApiProperty({ example: '/api/auth/signup' }) path: string;
  @ApiProperty({ example: '2026-10-05T12:00:00.000Z' }) timestamp: string;
  @ApiPropertyOptional({ example: 'b0f3c1de-...' }) requestId?: string;
}
