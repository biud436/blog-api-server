import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostTempDto {
    /**
     * @title 제목
     */
    @IsString()
    @IsNotEmpty({
        message: '제목을 입력해주세요.',
    })
    title!: string;

    /**
     * @title 내용
     */
    @IsString({
        message: '내용을 입력해주세요.',
    })
    content!: string;
}
