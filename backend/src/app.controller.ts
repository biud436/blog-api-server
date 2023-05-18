import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get()
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
    login() {
        return { message: 'Hello world!' };
    }
}
