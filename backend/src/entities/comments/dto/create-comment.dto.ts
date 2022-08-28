import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePostCommentDto {
    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    parentCommentId?: number;

    @ApiProperty()
    postId: number;
}
