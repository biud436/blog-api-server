import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class MoveCategoryDto {
    /**
     * @title 기존 카테고리의 ID (PK)
     */
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    prevCategoryId?: number;

    /**
     * @title 이동할 곳의 부모 카테고리의 ID (PK)
     */
    @ApiProperty()
    @IsNumber()
    newCategoryParentId!: number;
}
