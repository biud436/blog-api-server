export { ApiProperty } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import * as Validator from 'class-validator';

export namespace Assert {
  export function IsOptional() {
    return applyDecorators(Validator.IsOptional());
  }

  export function IsNotEmpty(message?: string) {
    if (!message) {
      message = '내용을 입력해주세요.';
    }

    return applyDecorators(
      Validator.IsNotEmpty({
        message,
      }),
    );
  }

  export function IsNumber() {
    return applyDecorators(
      Validator.IsNumber(
        {
          maxDecimalPlaces: 2,
        },
        {
          message: '숫자만 입력하세요.',
        },
      ),
    );
  }

  export function Matches(pattern: RegExp, options: { message: string }) {
    return applyDecorators(
      Validator.Matches(pattern, {
        message: options.message,
      }),
    );
  }

  export function IsEmail() {
    return applyDecorators(
      Validator.IsEmail({
        message: '이메일 형식이 아닙니다.',
      }),
    );
  }

  export function MinLength(min: number, options: { message: string }) {
    return applyDecorators(
      Validator.MinLength(min, {
        message: options.message,
      }),
    );
  }

  export function MaxLength(max: number, options: { message: string }) {
    return applyDecorators(
      Validator.MaxLength(max, {
        message: options.message,
      }),
    );
  }
}
