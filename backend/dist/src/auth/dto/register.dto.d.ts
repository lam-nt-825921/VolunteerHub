import { Role } from '../../generated/prisma/enums';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName?: string;
    role?: Role;
}
