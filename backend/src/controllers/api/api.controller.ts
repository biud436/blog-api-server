import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { UploadFolder } from 'src/common/decorators/upload-folder';

@Controller('api')
@ApiTags('테스트 API')
export class ApiController {
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
