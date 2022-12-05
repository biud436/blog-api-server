import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostTempDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({
        message: '제목을 입력해주세요.',
    })
    title: string;

    @ApiProperty()
    @IsString({
        message: '내용을 입력해주세요.',
    })
    content: string;
}
