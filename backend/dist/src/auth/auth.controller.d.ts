import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
                role: import("../generated/prisma/enums").Role;
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
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            role: import("../generated/prisma/enums").Role;
        };
    }>;
    refresh(req: Request): Promise<{
        accessToken: string;
    }>;
    logout(userId: number, res: Response): Promise<{
        message: string;
    }>;
    test(): {
        message: string;
    };
}
