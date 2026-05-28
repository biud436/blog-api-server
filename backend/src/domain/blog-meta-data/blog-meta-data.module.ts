import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { BlogMetaData } from './blog-meta-data.entity';
import { BlogMetaDataService } from './blog-meta-data.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([BlogMetaData])],
  providers: [BlogMetaDataService],
  exports: [BlogMetaDataService],
})
export class BlogMetaDataModule {}
