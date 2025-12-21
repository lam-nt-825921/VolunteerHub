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
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';
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

  /**
   * Đăng ký tài khoản người dùng mới
   * @param dto - Thông tin đăng ký (email, password, fullName)
   * @returns Thông tin người dùng đã tạo
   * @throws ConflictException nếu email đã tồn tại
   */
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
        role: Role.VOLUNTEER,
      },
    });

    return user;
  }

  /**
   * Đăng nhập và tạo access token + refresh token
   * @param dto - Thông tin đăng nhập (email, password)
   * @returns Access token, refresh token và thông tin người dùng
   * @throws UnauthorizedException nếu email/password không đúng hoặc tài khoản không active
   */
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
      user: user,
    };
  }

  /**
   * Làm mới access token bằng refresh token
   * @param refreshToken - Refresh token hiện tại
   * @returns Access token và refresh token mới
   * @throws UnauthorizedException nếu refresh token không hợp lệ, hết hạn, hoặc không khớp với DB
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token không được cung cấp');
  }

  let payload: JwtPayload;
  try {
    payload = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  } catch (error) {
    throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true, refreshToken: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
  }

  if (user.refreshToken !== refreshToken) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new UnauthorizedException('Refresh token không hợp lệ');
  }

  const tokens = await this.generateTokens(user.id, user.role);

  await this.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

  /**
   * Đăng xuất người dùng bằng cách xóa refresh token
   * @param userId - ID của người dùng cần đăng xuất
   */
  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Tạo access token và refresh token mới cho người dùng
   * @param userId - ID của người dùng
   * @param role - Vai trò của người dùng
   * @returns Access token (hết hạn sau 2 giờ) và refresh token (hết hạn sau 7 ngày)
   */
  private async generateTokens(userId: number, role: Role) {
    const payload: JwtPayload = { sub: userId, email: '', role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '2h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Cập nhật refresh token của người dùng trong database
   * @param userId - ID của người dùng
   * @param refreshToken - Refresh token mới (hoặc null để xóa)
   */
  private async updateRefreshToken(userId: number, refreshToken: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * Xác thực và lấy thông tin người dùng theo ID (dùng cho JwtStrategy)
   * @param userId - ID của người dùng
   * @returns Thông tin người dùng nếu hợp lệ và đang active
   * @throws UnauthorizedException nếu người dùng không tồn tại hoặc không active
   */
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, fullName: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }


}