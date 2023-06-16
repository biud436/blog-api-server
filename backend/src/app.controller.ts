import { TypedRoute } from '@nestia/core';
import { Controller, Get, Render, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
    /**
     * @internal
     * @returns
     */
    @Render('login')
    @Get('/login')
    login() {
        return { message: 'Hello world!' };
    }
}
