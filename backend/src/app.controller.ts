import {
    Controller,
    Get,
    InternalServerErrorException,
    Render,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
    @Get()
    @ApiExcludeEndpoint()
    getHello(): string {
        return process.platform;
    }

    @Render('login')
    @Get('/login')
    @ApiExcludeEndpoint()
    login() {
        return { message: 'Hello world!' };
    }
}
