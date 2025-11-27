import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../generated/prisma/enums';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: {
                email: string;
                password: string;
                fullName: string;
                avatar: string | null;
                phone: string | null;
                role: Role;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                refreshToken: string | null;
                refreshTokenExpiresAt: Date | null;
                id: number;
            };
            password: undefined;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            role: Role;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<void>;
    private generateTokens;
    private updateRefreshToken;
    validateUser(userId: number): Promise<{
        email: string;
        fullName: string;
        role: Role;
        isActive: boolean;
        id: number;
    }>;
}
