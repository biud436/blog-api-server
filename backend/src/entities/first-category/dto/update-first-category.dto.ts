import { PartialType } from '@nestjs/swagger';
import { CreateFirstCategoryDto } from './create-first-category.dto';

export class UpdateFirstCategoryDto extends PartialType(
    CreateFirstCategoryDto,
) {}
