import { PartialType } from '@nestjs/swagger';
import { CreateBlogMetaDatumDto } from './create-blog-meta-datum.dto';

export class UpdateBlogMetaDatumDto extends PartialType(
  CreateBlogMetaDatumDto,
) {}
