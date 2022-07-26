import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';
import { CreateProfileDto } from 'src/entities/profile/dto/create-profile.dto';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthRequest {
    export class RequestDto {
        @IsString({
            message: 'username은 문자열이어야 합니다',
        })
        @ApiProperty({
            type: String,
            description: '유저 아이디',
        })
        username: string;
        @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/, {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        })
        @ApiProperty({
            type: String,
            description: '비밀 번호',
        })
        password: string;

        @IsEmail({}, { message: '이메일 형식이 아닙니다' })
        @ApiProperty({
            type: String,
            description: '이메일',
        })
        email: string;

        @IsString({ message: '별명을 문자열이어야 합니다' })
        @ApiProperty({
            type: String,
            description: '별명',
        })
        nickname: string;

        // @ApiProperty()
        // profile: CreateProfileDto;
    }
}
