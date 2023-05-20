import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class S3ImageUploadDto {
    /**
     * @title 포스트 아이디
     */
    @IsOptional()
    @IsNumber()
    postId?: number;
}
