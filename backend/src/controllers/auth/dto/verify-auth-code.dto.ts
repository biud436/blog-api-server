import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmailAddress } from '../utils/email-utils';

export class VerifyAuthCodeRequestDto {
    @ApiProperty({
        type: 'string',
    })
    @IsEmail()
    email!: EmailAddress;

    @ApiProperty()
    authCode!: string;
}
