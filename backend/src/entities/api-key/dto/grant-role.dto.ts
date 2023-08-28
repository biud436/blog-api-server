import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { ScopeRoles } from 'src/common/decorators/api/x-api-scope.decorator';

export class GrantRoleDto {
    @ApiProperty()
    @IsString()
    apiKey!: string;

    @ApiProperty()
    @IsEnum(ScopeRoles, { each: true })
    roles!: ScopeRoles[];
}
