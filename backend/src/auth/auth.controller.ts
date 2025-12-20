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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto, UserProfileDto } from './dto/response/auth-response.dto';


@ApiTags('auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công', type: UserProfileDto })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async register(@Body() dto: RegisterDto) {
    
    const response = await this.authService.register(dto);
    return plainToInstance(UserProfileDto, response);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
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
      expiresIn: 2 * 60 * 60, // 2 giờ (7200 giây)
      user: plainToInstance(UserProfileDto, tokens.user),
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiResponse({ status: 200, description: 'Token được làm mới thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
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
    expiresIn: 2 * 60 * 60, // 2 giờ (7200 giây)
  };
}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(@CurrentUser('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

}