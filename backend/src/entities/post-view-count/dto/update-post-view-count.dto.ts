import { PartialType } from '@nestjs/swagger';
import { CreatePostViewCountDto } from './create-post-view-count.dto';

export class UpdatePostViewCountDto extends PartialType(CreatePostViewCountDto) {}
