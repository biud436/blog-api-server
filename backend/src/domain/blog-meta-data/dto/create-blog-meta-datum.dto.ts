import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogMetaDatumDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  siteName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  githubUrl?: string;
}
