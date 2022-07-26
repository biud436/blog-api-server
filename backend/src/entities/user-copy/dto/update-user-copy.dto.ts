import { PartialType } from '@nestjs/swagger';
import { CreateUserCopyDto } from './create-user-copy.dto';

export class UpdateUserCopyDto extends PartialType(CreateUserCopyDto) {}
