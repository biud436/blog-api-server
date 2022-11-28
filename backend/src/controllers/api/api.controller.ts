import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { ApiService } from './api.service';

@Controller('api')
@ApiTags('테스트 API')
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    @Get('/check/admin')
    @JwtGuard()
    @AdminOnly()
    @CustomApiOkResponse({
        description: '관리자 권한 확인',
        operation: {},
        auth: true,
    })
    async checkAdmin() {
        return {
            isAdmin: true,
        };
    }
}
