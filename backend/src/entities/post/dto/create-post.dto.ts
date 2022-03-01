import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, Length, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsEmpty({
    message: '제목을 입력해주세요.',
  })
  title: string;

  @ApiProperty()
  @IsEmpty({
    message: '내용을 입력해주세요.',
  })
  @MinLength(1, {
    message: '내용을 입력해주세요.',
  })
  @MaxLength(4000, {
    message: '내용은 4000자 이내로 입력해주세요.',
  })
  content: string;

  @ApiProperty()
  uploadDate: Date;
}
