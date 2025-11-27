import { Role } from '../../generated/prisma/enums';
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string | null;
        role: Role;
        isActive: boolean;
    };
    constructor(partial: Partial<AuthResponseDto>);
}
