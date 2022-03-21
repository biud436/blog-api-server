import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EmailAddress } from '../auth.service';

export class SendAuthCodeRequestDto {
  @ApiProperty({
    type: 'string',
  })
  @IsEmail()
  email: EmailAddress;
}
