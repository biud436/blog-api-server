import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NewCategoryDto {
    /**
     * @title 카테고리 이름
     */
    @ApiProperty({
        description: '카테고리 이름',
        example: '카테고리',
    })
    categoryName!: string;

    /**
     * @title 부모 카테고리 이름
     */
    @ApiProperty({
        description: '부모 카테고리 이름',
        example: '부모_카테고리',
    })
    @IsString()
    @IsOptional()
    rootNodeName?: string;
}
