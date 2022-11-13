import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class S3ImageUploadDto {
    @ApiProperty()
    @IsNumber()
    postId: number;
}
