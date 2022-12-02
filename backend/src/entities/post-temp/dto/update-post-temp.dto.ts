import { PartialType } from '@nestjs/swagger';
import { CreatePostTempDto } from './create-post-temp.dto';

export class UpdatePostTempDto extends PartialType(CreatePostTempDto) {}
