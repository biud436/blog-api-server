import { Exclude, Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEmpty,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, Assert } from 'src/common/create-dto-common';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';

export class CreatePostDto {
    /**
     * @title 포스트 ID
     */
    @ApiProperty()
    @Assert.IsOptional()
    id?: number;

    /**
     * @title 글 제목
     * @default '제목 없음'
     */
    @ApiProperty()
    @Assert.IsNotEmpty('제목을 입력해주세요.')
    @IsString()
    title!: string;

    /**
     * @title 글 내용
     * @minLength 1
     */
    @ApiProperty()
    @Assert.MinLength(1, {
        message: '내용을 입력해주세요.',
    })
    @IsString()
    content!: string;

    /**
     * @title 업로드 일
     */
    @ApiProperty()
    @Assert.IsDate()
    @Assert.IsOptional()
    uploadDate?: Date;

    /**
     * @title 작성자 ID
     */
    authorId?: number;

    /**
     * @title 대분류 (FK)
     * @type uint
     */
    @ApiProperty()
    @IsNumber()
    categoryId?: number;

    /**
     * @title 비공개 글 작성 여부
     * @default false
     */
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;
}
