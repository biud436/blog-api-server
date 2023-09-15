import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeCategoryDto {
    /**
     * @title 카테고리 이름
     */
    @IsString()
    @ApiProperty({
        description: '카테고리 이름',
        example: '카테고리',
    })
    categoryName!: string;
}
