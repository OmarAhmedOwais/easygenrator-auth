import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { ErrorResponseDto } from '../../common/filters/error-response.dto.js';
import type { AppConfig } from '../../config/configuration.js';
import { REFRESH_COOKIE, REFRESH_COOKIE_PATH } from './auth.constants.js';
import { type AuthSession, AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

/**
 * Token transport:
 * - access token -> response body; the SPA keeps it in memory only (not localStorage = no XSS theft).
 * - refresh token -> httpOnly + SameSite=Strict cookie scoped to /api/auth (JS can't read it,
 *   other sites can't send it).
 */
@ApiTags('auth')
@Public()
@UseGuards(ThrottlerGuard)
@ApiTooManyRequestsResponse({ type: ErrorResponseDto, description: 'Rate limit exceeded' })
@Controller('auth')
export class AuthController {
  private readonly cookieSecure: boolean;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.cookieSecure = config.get('auth', { infer: true }).cookieSecure;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create an account and start a session' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'Validation failed' })
  @ApiConflictResponse({ type: ErrorResponseDto, description: 'Email already registered' })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respond(res, await this.authService.signUp(dto));
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email + password' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'Invalid email or password' })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respond(res, await this.authService.signIn(dto));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Rotate the refresh cookie and get a new access token' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    try {
      return this.respond(res, await this.authService.refresh(this.readCookie(req)));
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
      throw err;
    }
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Revoke the session and clear the refresh cookie' })
  @ApiNoContentResponse()
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.signOut(this.readCookie(req));
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  private respond(res: Response, { user, tokens }: AuthSession): AuthResponseDto {
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.cookieOptions(),
      maxAge: tokens.refreshMaxAgeMs,
    });
    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: tokens.accessExpiresIn,
      user,
    };
  }

  private readCookie(req: Request): string | undefined {
    const value: unknown = (req.cookies as Record<string, unknown> | undefined)?.[REFRESH_COOKIE];
    return typeof value === 'string' ? value : undefined;
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
    };
  }
}
