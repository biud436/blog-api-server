import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { MyBlogConfigService } from './my-config.service';

@Module({
    imports: [ConfigModule, DiscoveryModule],
    providers: [MyBlogConfigService],
})
export class MyBlogConfigModule {}
