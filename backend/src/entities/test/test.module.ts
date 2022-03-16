import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';

@Module({
  imports: [OrmModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
