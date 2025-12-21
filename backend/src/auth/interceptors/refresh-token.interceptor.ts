// src/auth/interceptors/refresh-token.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('RefreshTokenInterceptor');

/**
 * Interceptor tự động refresh token khi access token hết hạn
 * 
 * Flow:
 * 1. Bắt lỗi 401 từ JwtAuthGuard
 * 2. Kiểm tra xem có refresh token trong cookie không
 * 3. Nếu có, gọi refresh token API
 * 4. Verify access token mới và lấy user
 * 5. Set user vào request và tiếp tục xử lý request
 */
@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  private jwtService: JwtService;

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.jwtService = new JwtService({
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Intercept request và tự động refresh token nếu access token hết hạn
   * Bắt lỗi 401 từ JwtAuthGuard, kiểm tra refresh token trong cookie,
   * gọi refresh token service và set access token mới vào response header
   * @param context - Execution context
   * @param next - Call handler để tiếp tục xử lý request
   * @returns Observable với response hoặc error
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      catchError((error) => {
        if (
          error instanceof UnauthorizedException &&
          (error.message.includes('Token') ||
            error.message.includes('expired') ||
            error.message.includes('hết hạn'))
        ) {
          logger.log(`Access token expired, attempting to auto-refresh...`);

          const refreshToken = request.cookies?.refresh_token;

          if (!refreshToken) {
            logger.warn('No refresh token found, cannot auto-refresh');
            return throwError(() => error);
          }

          return new Observable((observer) => {
            this.authService
              .refreshToken(refreshToken)
              .then(async (tokens) => {
                logger.log('Token refreshed successfully, retrying request...');

                response.setHeader('X-New-Access-Token', tokens.accessToken);
                response.setHeader('X-Token-Expires-In', '7200');

                response.cookie('refresh_token', tokens.refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                  maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                try {
                  const payload = this.jwtService.verify(tokens.accessToken);
                  const user = await this.prisma.user.findUnique({
                    where: { id: payload.sub },
                    select: {
                      id: true,
                      email: true,
                      fullName: true,
                      role: true,
                      isActive: true,
                    },
                  });

                  if (user && user.isActive) {
                    request.user = user;
                    logger.log(`Auto-refresh successful, user ${user.id} authenticated, retrying request`);
                    
                    observer.error(
                      new UnauthorizedException({
                        message: 'Token đã được làm mới. Vui lòng thử lại với token mới.',
                        newAccessToken: tokens.accessToken,
                        expiresIn: 7200,
                      }),
                    );
                  } else {
                    observer.error(error);
                  }
                } catch (verifyError) {
                  logger.error('Failed to verify new access token:', verifyError);
                  observer.error(error);
                }
              })
              .catch((refreshError) => {
                logger.error('Failed to refresh token:', refreshError);
                response.clearCookie('refresh_token');
                observer.error(error);
              });
          });
        }

        return throwError(() => error);
      }),
    );
  }
}

