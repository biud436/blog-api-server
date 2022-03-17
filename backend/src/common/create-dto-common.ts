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

  export function IsString() {
    return applyDecorators(
      Validator.IsString({
        message: '문자열만 입력하세요',
      }),
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

  export function MinLength(min: number, options?: { message: string }) {
    if (!options) {
      options = {
        message: '최소 ' + min + '자 이상 입력해주세요.',
      };
    }
    return applyDecorators(
      Validator.MinLength(min, {
        message: options.message,
      }),
    );
  }

  export function MaxLength(max: number, options?: { message: string }) {
    if (!options) {
      options = {
        message: '내용은 ' + max + '자 이내로 입력해주세요.',
      };
    }
    return applyDecorators(
      Validator.MaxLength(max, {
        message: options.message,
      }),
    );
  }

  export function IsDate() {
    return applyDecorators(
      Validator.IsDate({
        message: '날짜 형식이 아닙니다.',
      }),
    );
  }
}
