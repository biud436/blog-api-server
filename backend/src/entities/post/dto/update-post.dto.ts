import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Assert } from 'src/common/config/create-dto-common';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto {
    /**
     * @title 글 제목
     */
    @ApiProperty()
    @Assert.IsNotEmpty('제목을 입력해주세요.')
    @IsString()
    title!: string;

    /**
     * @title 글 내용
     * @minLength 1
     * @maxLength 4000
     */
    @ApiProperty()
    @Assert.MinLength(1, {
        message: '내용을 입력해주세요.',
    })
    @Assert.MaxLength(4000)
    @IsString()
    content!: string;

    authorId?: number;

    /**
     * @title 대분류 (FK)
     */
    @ApiProperty()
    @IsNumber()
    categoryId?: number;
}
