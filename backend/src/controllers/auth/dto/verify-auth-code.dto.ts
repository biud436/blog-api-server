import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { EmailAddress } from '../utils/email-utils';

export class VerifyAuthCodeRequestDto {
    /**
     * @title 이메일
     */
    @ApiProperty({
        description: '이메일',
    })
    @IsEmail()
    email!: EmailAddress;

    /**
     * @title 인증 코드
     */
    @ApiProperty({
        description: '인증 코드',
    })
    @IsString()
    authCode!: string;
}
