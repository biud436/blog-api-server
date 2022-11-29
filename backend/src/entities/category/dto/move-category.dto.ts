import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MoveCategoryDto {
    /**
     * 기존 카테고리의 ID (PK)
     */
    @ApiProperty()
    @IsNumber()
    prevCategoryId: number;

    /**
     * 이동할 곳의 부모 카테고리의 ID (PK)
     */
    @ApiProperty()
    @IsNumber()
    newCategoryParentId: number;
}
