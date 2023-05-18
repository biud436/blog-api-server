import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmailAddress } from '../utils/email-utils';

export class SendAuthCodeRequestDto {
    @ApiProperty({
        type: 'string',
    })
    @IsEmail()
    email!: EmailAddress;
}
