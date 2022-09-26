import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
    @Get()
    @ApiExcludeEndpoint()
    getHello(): string {
        return process.platform;
    }
}
