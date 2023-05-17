import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { UploadFolder } from 'src/common/decorators/upload-folder';
import { ApiService } from './api.service';

@Controller('api')
@ApiTags('테스트 API')
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    /**
     * 관리자 권한 확인
     */
    @Get('/check/admin')
    @JwtGuard()
    @AdminOnly()
    checkAdmin() {
        return {
            isAdmin: true,
        };
    }
}
