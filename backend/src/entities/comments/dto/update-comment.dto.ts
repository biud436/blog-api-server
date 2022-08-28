import { PartialType } from '@nestjs/swagger';
import { CreatePostCommentDto } from './create-comment.dto';

export class UpdatePostCommentDto extends PartialType(CreatePostCommentDto) {}
