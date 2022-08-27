import { Exclude, Transform, Type } from 'class-transformer';
import {
    IsEmpty,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, Assert } from 'src/common/create-dto-common';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';

export class CreatePostDto {
    @ApiProperty()
    @Assert.IsOptional()
    id?: number;

    /**
     * 글 제목
     */
    @ApiProperty()
    @Assert.IsNotEmpty('제목을 입력해주세요.')
    @IsString()
    title: string;

    /**
     * 글 내용
     */
    @ApiProperty()
    @Assert.MinLength(1, {
        message: '내용을 입력해주세요.',
    })
    @Assert.MaxLength(4000)
    @IsString()
    content: string;

    /**
     * 업로드 일
     */
    @ApiProperty()
    @Assert.IsDate()
    @Assert.IsOptional()
    uploadDate?: Date;

    /**
     * 작성자 ID (FK)
     */
    @ApiProperty()
    @IsNumber()
    authorId?: number;

    /**
     * 대분류 (FK)
     */
    @ApiProperty()
    @IsNumber()
    firstCategoryId?: number;

    /**
     * 중분류 (FK)
     */
    @ApiProperty()
    @IsNumber()
    secondCategoryId?: number;

    viewCount?: PostViewCount;
}
