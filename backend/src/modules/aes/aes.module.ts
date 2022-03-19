import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AES256Provider } from './aes-256.provider';

@Module({
  imports: [ConfigModule],
  providers: [AES256Provider],
  exports: [AES256Provider],
})
export class AesModule {}
