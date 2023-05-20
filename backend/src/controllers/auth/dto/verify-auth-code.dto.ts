import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmailAddress } from '../utils/email-utils';

export class VerifyAuthCodeRequestDto {
    /**
     * @title 이메일
     */
    @IsEmail()
    email!: EmailAddress;

    /**
     * @title 인증 코드
     */
    authCode!: string;
}
