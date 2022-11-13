import {
    IsByteLength,
    IsEmpty,
    IsMimeType,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';
import { ApiProperty } from 'src/common/create-dto-common';

export class CreateImageDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    id?: number;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    fieldname: string;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    originalname: string;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    encoding: string;

    @ApiProperty()
    @IsMimeType()
    @IsEmpty()
    mimetype: string;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    destination: string;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    filename: string;

    @ApiProperty()
    @IsString()
    @IsEmpty()
    path: string;

    @ApiProperty()
    @IsNumber()
    @MaxLength(1024 * 1024 * 2)
    size: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    postId?: number;
}
