import { PartialType } from '@nestjs/swagger';
import { CreateConnectInfoDto } from './create-connect-info.dto';

export class UpdateConnectInfoDto extends PartialType(CreateConnectInfoDto) {}
