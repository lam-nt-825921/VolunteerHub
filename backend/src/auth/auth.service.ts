// src/auth/auth.service.ts
import {
    Logger,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../generated/prisma/enums';

interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ==================== ĐĂNG KÝ ====================
  async register(dto: RegisterDto) {
    const existed = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existed) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        fullName: dto.fullName?.trim() || dto.email.split('@')[0],
        role: dto.role || Role.VOLUNTEER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user,
        password: undefined, // không trả password
      },
    };
  }

  // ==================== ĐĂNG NHẬP ====================
  async login(dto: LoginDto) {
    const logger = new Logger('AuthService');
    logger.log(`Attempting login for email: ${dto.email}`);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  // ==================== REFRESH TOKEN ====================
 async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token không được cung cấp');
  }

  // 1. Verify refresh token
  let payload: JwtPayload;
  try {
    payload = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  } catch (error) {
    throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  // 2. Lấy user + kiểm tra refresh token trong DB (plain text)
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true, refreshToken: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
  }

  if (user.refreshToken !== refreshToken) {
    // Có thể bị đánh cắp → xóa luôn để vô hiệu hóa các token khác
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new UnauthorizedException('Refresh token không hợp lệ');
  }

  // 3. Tạo token mới + rotation
  const tokens = await this.generateTokens(user.id, user.role);

  // 4. Lưu refresh token mới vào DB (plain text)
  await this.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

  // ==================== LOGOUT ====================
  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ==================== HELPER ====================
  private async generateTokens(userId: number, role: Role) {
    const payload: JwtPayload = { sub: userId, email: '', role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // Dùng cho JwtStrategy
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, fullName: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }


}