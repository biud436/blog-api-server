import { PartialType } from '@nestjs/swagger';
import { CreateSecondCategoryDto } from './create-second-category.dto';

export class UpdateSecondCategoryDto extends PartialType(CreateSecondCategoryDto) {}
