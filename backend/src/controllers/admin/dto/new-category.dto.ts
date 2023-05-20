import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class NewCategoryDto {
    /**
     * @title 카테고리 이름
     */
    categoryName!: string;

    /**
     * @title 부모 카테고리 이름
     */
    @IsOptional()
    rootNodeName?: string;
}
