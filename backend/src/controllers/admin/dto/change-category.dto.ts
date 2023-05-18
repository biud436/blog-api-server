import { ApiProperty } from '@nestjs/swagger';

export class ChangeCategoryDto {
    @ApiProperty()
    categoryName!: string;
}
