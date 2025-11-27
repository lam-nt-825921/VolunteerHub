"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('=== FILE MAIN.TS ĐANG ĐƯỢC CHẠY ===');
console.log('Nếu thấy dòng này → main.ts đúng');
console.log('Nếu KHÔNG thấy → bạn đang chạy file main.ts khác!');
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
    }));
    app.enableCors({
        origin: [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
        ],
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`🚀 API Server đang chạy tại: http://localhost:${port}`);
    logger.log(`🌐 Frontend truy cập từ: http://localhost:5000`);
    logger.log(`📍 Base URL: http://localhost:${port}`);
    logger.log(`🔐 Login: http://localhost:${port}/auth/login`);
}
bootstrap();
//# sourceMappingURL=main.js.map