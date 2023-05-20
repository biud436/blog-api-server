import { ApiProperty } from '@nestjs/swagger';

export class ChangeCategoryDto {
    /**
     * @title 카테고리 이름
     */
    categoryName!: string;
}
