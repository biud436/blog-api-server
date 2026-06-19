import { PartialType } from '@nestjs/swagger';
import { CreateCategoryGroupDto } from './create-category-group.dto';

export class UpdateCategoryGroupDto extends PartialType(
  CreateCategoryGroupDto,
) {}
