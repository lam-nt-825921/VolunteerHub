// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Get,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto, UserProfileDto } from './dto/response/auth-response.dto';


@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    
    const response = await this.authService.register(dto);
    return plainToInstance(UserProfileDto, response);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const logger = new Logger('AuthController');
    logger.log('Login attempt');
    const tokens = await this.authService.login(dto);
    
    // Lưu refreshToken vào httpOnly cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return plainToInstance(AuthResponseDto, {
      accessToken: tokens.accessToken,
      expiresIn: 15 * 60, // 15 phút
      user: plainToInstance(UserProfileDto, tokens.user),
    });
  }

@Post('refresh')
@HttpCode(HttpStatus.OK)
async refreshTokenWithCookie(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const oldRefreshToken = req.cookies?.refresh_token;

  const tokens = await this.authService.refreshToken(oldRefreshToken);

  // Set lại cookie mới
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });

  return {
    accessToken: tokens.accessToken,
    expiresIn: 15 * 60, // 15 phút
  };
}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

}