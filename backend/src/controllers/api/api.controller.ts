import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { UploadFolder } from 'src/common/decorators/upload-folder';

@Controller('api')
export class ApiController {
    /**
     * 관리자 권한을 확인합니다.
     *
     * @tag API
     * @returns
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
