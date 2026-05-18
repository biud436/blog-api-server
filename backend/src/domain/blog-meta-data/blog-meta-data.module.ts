import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { BlogMetaData } from './blog-meta-data.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([BlogMetaData])],
})
export class BlogMetaDataModule {}
