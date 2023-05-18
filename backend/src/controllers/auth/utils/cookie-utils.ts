/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { LocalDate, LocalDateTime } from '@js-joda/core';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { CookieOptions } from 'express';

export function getCookieSettingWithAccessToken(
    jwtSecretExpirationTime: LocalDateTime | LocalDate,
): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        expires: DateTimeUtil.toDate(jwtSecretExpirationTime)!,
    };
}

export function getCookieSettingWithRefreshToken(
    jwtRefreshTokenExpirationTime: LocalDateTime | LocalDate,
): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        expires: DateTimeUtil.toDate(jwtRefreshTokenExpirationTime)!,
    };
}
