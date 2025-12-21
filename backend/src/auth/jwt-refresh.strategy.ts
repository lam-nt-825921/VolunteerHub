// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    } as any);
  }

  /**
   * Xác thực refresh token từ cookie và trả về thông tin cần thiết
   * @param req - Request object chứa refresh token cookie
   * @param payload - JWT payload chứa user ID
   * @returns Object chứa userId và refreshToken
   * @throws UnauthorizedException nếu refresh token không tồn tại trong cookie
   */
  validate(req: Request, payload: { sub: number }) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }
    return { userId: payload.sub, refreshToken };
  }
}