import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export interface ILoginDto {
    /**
     * @title 아이디
     */
    username: string;

    /**
     * @title 비밀번호
     * @pattern ^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$
     */

    password: string;
}
