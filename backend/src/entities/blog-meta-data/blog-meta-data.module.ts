import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogMetaDataService } from './blog-meta-data.service';
import { BlogMetaData } from './entities/blog-meta-data.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BlogMetaData])],
    providers: [BlogMetaDataService],
    exports: [BlogMetaDataService],
})
export class BlogMetaDataModule {}
