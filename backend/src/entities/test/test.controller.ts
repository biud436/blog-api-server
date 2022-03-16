import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  async test() {
    return await this.testService.create({
      content: 'test',
      title: 'test',
      uploadDate: new Date(),
    });
  }

  @Get('find')
  async find() {
    return await this.testService.findAll(0, 10);
  }
}
