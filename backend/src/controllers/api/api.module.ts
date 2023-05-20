import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ApiController],
})
export class ApiModule {}
