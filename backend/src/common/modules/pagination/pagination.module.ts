import { Module } from '@nestjs/common';
import { PaginationProvider } from './pagination-repository';

@Module({
    providers: [PaginationProvider],
    exports: [PaginationProvider],
})
export class PaginationModule {}
