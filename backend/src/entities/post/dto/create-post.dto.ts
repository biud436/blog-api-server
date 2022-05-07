import { ApiProperty, Assert } from 'src/common/create-dto-common';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';

export class CreatePostDto {
    @ApiProperty()
    @Assert.IsNumber()
    @Assert.IsOptional()
    id?: number;

    /**
     * 글 제목
     */
    @ApiProperty()
    @Assert.IsNotEmpty('제목을 입력해주세요.')
    title: string;

    /**
     * 글 내용
     */
    @ApiProperty()
    @Assert.IsNotEmpty('내용을 입력해주세요.')
    @Assert.MaxLength(1, {
        message: '내용을 입력해주세요.',
    })
    @Assert.MaxLength(4000)
    content: string;

    /**
     * 업로드 일
     */
    @ApiProperty()
    @Assert.IsDate()
    uploadDate: Date;

    /**
     * 작성자 ID (FK)
     */
    @ApiProperty()
    @Assert.IsNumber()
    authorId: number;

    /**
     * 대분류 (FK)
     */
    @ApiProperty()
    firstCategoryId: number;

    /**
     * 중분류 (FK)
     */
    @ApiProperty()
    secondCategoryId: number;

    @ApiProperty({
        type: 'enum',
        enum: ['id', 'count'],
    })
    viewCount: Pick<PostViewCount, 'id' | 'count'>;
}
