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

  /**
   * Đăng ký tài khoản mới
   * @param dto - Thông tin đăng ký (email, password, fullName)
   * @returns Thông tin người dùng đã đăng ký
   */
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

  /**
   * Đăng nhập và nhận access token
   * @param dto - Thông tin đăng nhập (email, password)
   * @param res - Response object để set cookie
   * @returns Access token, expiresIn và thông tin người dùng
   */
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
    
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return plainToInstance(AuthResponseDto, {
      accessToken: tokens.accessToken,
      expiresIn: 2 * 60 * 60,
      user: plainToInstance(UserProfileDto, tokens.user),
    });
  }

  /**
   * Làm mới access token bằng refresh token từ cookie
   * @param req - Request object chứa refresh token cookie
   * @param res - Response object để set cookie mới
   * @returns Access token mới và thời gian hết hạn
   */
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

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      expiresIn: 2 * 60 * 60,
    };
  }

  /**
   * Đăng xuất người dùng và xóa refresh token
   * @param userId - ID của người dùng hiện tại
   * @param res - Response object để xóa cookie
   * @returns Thông báo đăng xuất thành công
   */
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