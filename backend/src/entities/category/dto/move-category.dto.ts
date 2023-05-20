import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MoveCategoryDto {
    /**
     * @title 기존 카테고리의 ID (PK)
     */
    prevCategoryId?: number;

    /**
     * @title 이동할 곳의 부모 카테고리의 ID (PK)
     */
    @IsNumber()
    newCategoryParentId!: number;
}
