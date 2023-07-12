import {
    ChronoField,
    ChronoUnit,
    convert,
    DateTimeFormatter,
    LocalDate,
    LocalDateTime,
    LocalTime,
    nativeJs,
    ZonedDateTime,
    ZoneId,
    ZoneOffset,
} from '@js-joda/core';
import { BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface UTCTimeCollection {
    toUTCStart: string;
    toUTCEnd: string;
}

/**
 * @interface DateTimeUtilImpl
 */
interface DateTimeUtilImpl {
    /**
     * 주어진 날짜의 시간을 유닉스 타임스탬프로 변환합니다.
     * @param date
     */
    getUnixTime(date: LocalDateTime): number;

    /**
     * 주어진 날짜의 현지 시간 기준 요일을 숫자값으로 반환합니다.
     * @param date
     */
    getDay(date: LocalDateTime): number;

    /**
     * 주어진 날짜의 현지 시간 기준 요일을 문자열로 반환합니다.
     * @param date
     */
    getDayOfWeek(date: LocalDateTime): string;

    /**
     * LocalDateTime 객체의 월 값을 현지 시간에 맞춰 반환합니다.
     * ? 월은 1부터 시작합니다.
     *
     * @param date
     */
    getMonth(date: LocalDateTime): number;

    /**
     * 주어진 날짜의 현지 시간 기준 일을 반환합니다.
     */
    getDate(date: LocalDateTime): number;

    /**
     * LocalDateTime을 `ZonedDateTime` 타입으로 변환합니다.
     * @param date
     * @param zoneId Asia/Seoul
     */
    parseZonedDateTime(date: LocalDateTime, zoneId: string): ZonedDateTime;

    /**
     * 타임존 문자열(ISO)을 `ZonedDateTime` 타입으로 변환합니다.
     *
     * @param rawTimeString 2022-02-17T10:44:10.261+09:00
     * @param zoneId Asia/Seoul
     */
    parseZonedDateTime(rawTimeString: string, zoneId: string): ZonedDateTime;

    /**
     * 특정 시간대에서 UTC 타입으로 변환합니다.
     * @param zoneId
     */
    toUTCZonedDateTime(zoneId: string): ZonedDateTime;

    /**
     * UTC 표준 시간대를 사용하여 날짜를 문자열로 변환합니다.
     */
    toUTCString(date: ZonedDateTime, zoneId: string): UTCTimeCollection;

    /**
     * UTC 표준 시간대에 9시간(UTC +9)을 더해서 문자열로 변환합니다.
     * @param date
     * @param zoneId
     */
    toKSTString(date: string, zoneId: string): string;

    /**
     * 현재 시간을 반환합니다.
     */
    now(): LocalDateTime;

    of(date: Date): LocalDateTime;
}

/**
 * @class InternalDataTimeUtil
 * @author 어진석
 */
class InternalDataTimeUtil implements DateTimeUtilImpl {
    private DATE_FORMATTER = DateTimeFormatter.ofPattern('yyyy-MM-dd');
    private DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern(
        'yyyy-MM-dd HH:mm:ss',
    );

    /**
     * 날짜 데이터를 지정된 문자열로 변환합니다.
     *
     * @link https://github.com/jojoldu/nodejs-unit-test/blob/master/src/util/DateTimeUtil.ts
     * @param localDate
     * @returns
     */
    toString(localDate: LocalDate | LocalDateTime): string {
        if (!localDate) {
            return '';
        }

        if (localDate instanceof LocalDate) {
            return localDate.format(this.DATE_FORMATTER);
        }
        return localDate.format(this.DATE_TIME_FORMATTER);
    }

    /**
     * 날짜 데이터를 JS Date 타입으로 변환합니다.
     *
     * @link https://github.com/jojoldu/nodejs-unit-test/blob/master/src/util/DateTimeUtil.ts
     * @param value
     * @returns
     */
    toDate(value: LocalDateTime | LocalDate): Date | null {
        if (!value) {
            return null;
        }

        return convert(value).toDate();
    }

    /**
     * JS Date 타입을 LocalDate 타입으로 변환합니다.
     *
     * @link https://github.com/jojoldu/nodejs-unit-test/blob/master/src/util/DateTimeUtil.ts
     * @param date
     * @returns
     */
    toLocalDate(date: Date): LocalDate | null {
        if (!date) {
            return null;
        }
        return LocalDate.from(nativeJs(date));
    }

    addYears(date: Date, _years = 50): LocalDate | null {
        const localDate = this.toLocalDate(date);
        if (!localDate) {
            return null;
        }

        return localDate.plusYears(_years);
    }

    addDay(date: Date, days: number): LocalDate | null {
        const localDate = this.toLocalDate(date);
        if (!localDate) {
            return null;
        }

        return localDate.plusDays(days);
    }

    now() {
        return LocalDateTime.now();
    }

    getUnixTime(date: LocalDateTime) {
        const time = date.toInstant(ZoneOffset.UTC).toEpochMilli();
        const unixtime = Math.floor(time / 1000);

        return unixtime;
    }

    getDay(date: LocalDateTime) {
        return date.dayOfWeek().value();
    }

    getDayOfWeek(date: LocalDateTime) {
        return date.dayOfWeek().toString();
    }

    getMonth(date: LocalDateTime) {
        return date.month().value();
    }

    getDate(date: LocalDateTime): number {
        return date.dayOfMonth();
    }

    parseZonedDateTime(date: LocalDateTime, zoneId: string): ZonedDateTime;
    parseZonedDateTime(rawTimeString: string, zoneId: string): ZonedDateTime;
    parseZonedDateTime(
        date: LocalDateTime | string,
        zoneId: string | 'Asia/Seoul',
    ): ZonedDateTime {
        if (typeof date === 'string') {
            return ZonedDateTime.parse(date).withZoneSameInstant(
                ZoneId.of(zoneId),
            );
        } else {
            return date.atZone(ZoneId.of(zoneId));
        }
    }

    toUTCZonedDateTime(zoneId: string): ZonedDateTime {
        const date = ZonedDateTime.now(ZoneId.of(zoneId));
        const utcTime = date.withZoneSameInstant(ZoneId.of('UTC'));

        return utcTime;
    }

    toUTCString(
        date: ZonedDateTime | string,
        zoneId: string,
    ): UTCTimeCollection {
        // 변환 처리
        if (typeof date === 'string') {
            try {
                const jodaDate = LocalDate.parse(
                    date,
                    DateTimeFormatter.ISO_LOCAL_DATE,
                );
                const zonedDateTime = ZonedDateTime.of(
                    jodaDate,
                    LocalTime.of(0, 0),
                    ZoneId.of('UTC'),
                );

                date = zonedDateTime;
            } catch (e) {
                throw new BadRequestException('날짜 타입이 올바르지 않습니다.');
            }
        }

        // 타겟 시간대
        const baseZoneId = ZoneId.of(zoneId);

        // UTC 시간대
        const utcZoneId = ZoneId.of('UTC');

        // 타겟 시간대의 날짜 타입
        const baseLocalDate = date.toLocalDate().atStartOfDay(baseZoneId);
        const startOfTime = baseLocalDate.with(ChronoField.HOUR_OF_DAY, 0);
        const endOfTime = baseLocalDate
            .with(ChronoField.HOUR_OF_DAY, 23)
            .with(ChronoField.MINUTE_OF_HOUR, 59);

        const toUTCStart = startOfTime.withZoneSameInstant(utcZoneId);
        const toUTCEnd = endOfTime.withZoneSameInstant(utcZoneId);

        return {
            toUTCStart: toUTCStart.format(
                DateTimeFormatter.ISO_OFFSET_DATE_TIME,
            ),
            toUTCEnd: toUTCEnd.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
        };
    }

    toKSTString(raw: string, zoneId: string): string {
        const baseZoneId = ZoneId.of(zoneId);

        const useTimeZone =
            ZonedDateTime.parse(raw).withZoneSameInstant(baseZoneId);

        return useTimeZone.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    /**
     * 토큰 만료 시간을 반환합니다.
     *
     * @param jwtSecretExpirationTime 2h
     * @returns
     */
    extractJwtExpirationTime(jwtSecretExpirationTime: string) {
        let expires = DateTimeUtil.now();
        jwtSecretExpirationTime.split(' ').forEach((time) => {
            if (time.includes('d')) {
                expires = expires.plus(
                    parseInt(time.replace('d', '')),
                    ChronoUnit.DAYS,
                );
            } else if (time.includes('h')) {
                expires = expires.plus(
                    parseInt(time.replace('h', '')),
                    ChronoUnit.HOURS,
                );
            } else if (time.includes('m')) {
                expires = expires.plus(
                    parseInt(time.replace('m', '')),
                    ChronoUnit.MINUTES,
                );
            } else if (time.includes('s')) {
                expires = expires.plus(
                    parseInt(time.replace('s', '')),
                    ChronoUnit.SECONDS,
                );
            }
        });

        return expires;
    }

    toServerTime(selectedDay: string, timezone: string) {
        const day = selectedDay;
        const date = { startUtc: null, endUtc: null } as Record<
            string,
            string | null
        >;
        const zoneId = timezone;
        const format = 'YYYY-MM-DD HH:mm:ss';

        date.startUtc = dayjs
            .tz(day, zoneId)
            .startOf('day')
            .utc()
            .format(format);
        date.endUtc = dayjs.tz(day, zoneId).endOf('day').utc().format(format);

        return date;
    }

    toWhereQuery(
        columnAliasName: string,
        selectedDay: string,
        timezone = 'UTC',
    ): [string, Record<string, string | null>] {
        const query = `${columnAliasName} >= :startUtc and ${columnAliasName} <= :endUtc`;
        const date = this.toServerTime(selectedDay, timezone);

        return [query, date];
    }

    of(date: Date): LocalDateTime {
        return LocalDateTime.of(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
        );
    }

    /**
     * moment.js를 이용하여 타임존을 변환합니다.
     *
     * @deprecated
     * @param date
     * @param timezone
     * @returns
     */
    toTimezone(date: dayjs.Dayjs, timezone: string): Date {
        let raw = '';
        let format = 'YYYY-MM-DD HH:mm:ss';

        if (date instanceof Date) {
            raw = date.toString();
            format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
        }

        return dayjs.utc(date).tz(timezone).toDate();
    }

    /**
     * moment.js를 사용하여 날짜를 변환합니다.
     *
     * @deprecated
     * @param date
     * @returns
     */
    toDateFormat(date: dayjs.Dayjs): Date {
        const expectFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

        return dayjs(date, expectFormat).toDate();
    }
}

export const DateTimeUtil = new InternalDataTimeUtil();
