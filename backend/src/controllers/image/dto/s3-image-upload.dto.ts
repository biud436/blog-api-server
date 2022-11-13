import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class S3ImageUploadDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    postId: number;
}
