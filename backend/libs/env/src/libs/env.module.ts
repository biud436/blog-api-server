import { Module } from '@nestjs/common';
import { EnvService } from '..';

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
