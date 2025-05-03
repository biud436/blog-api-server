import { Controller, Get, Render, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get('/')
  @ApiExcludeEndpoint()
  index() {
    return { message: 'Hello world!' };
  }

  /**
   * @internal
   * @returns
   */
  @Render('login')
  @Get('/login')
  @ApiExcludeEndpoint()
  login() {
    return { message: 'Hello world!' };
  }
}
