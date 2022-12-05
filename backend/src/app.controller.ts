import {
    Controller,
    Get,
    InternalServerErrorException,
    Render,
    Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get()
    @ApiExcludeEndpoint()
    getHello(
        @Res({
            passthrough: true,
        })
        res: Response,
    ): void {
        res.redirect('https://github.com/biud436/blog-api-server');
    }

    @Render('login')
    @Get('/login')
    @ApiExcludeEndpoint()
    login() {
        return { message: 'Hello world!' };
    }
}
