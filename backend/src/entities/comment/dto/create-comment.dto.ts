import {
    IsEmpty,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateIf,
} from 'class-validator';
import { IsNullable } from 'src/common/decorators/is-nullable.decorator';

export class CreateCommentDto {
    /**
     * @title 포스트 ID
     */
    @IsNumber()
    @IsNotEmpty()
    postId!: number;

    /**
     * @title 내용
     */
    @IsString()
    @IsNotEmpty()
    content!: string;

    /**
     * 부모 댓글이 없다면, 조상 댓글 ID와 같은 값을 가짐
     * @title 부모 댓글 ID
     */
    @IsNumber()
    @IsNullable()
    parentId?: number;
}
