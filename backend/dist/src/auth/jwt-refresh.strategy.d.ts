import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private config;
    constructor(config: ConfigService);
    validate(req: Request, payload: {
        sub: number;
    }): {
        userId: number;
        refreshToken: any;
    };
}
export {};
