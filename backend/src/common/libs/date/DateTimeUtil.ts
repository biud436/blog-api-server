import {
    ChronoField,
    ChronoUnit,
    convert,
    DateTimeFormatter,
    LocalDate,
    LocalDateTime,
    nativeJs,
    ZonedDateTime,
    ZoneId,
    ZoneOffset,
} from '@js-joda/core';

interface UTCTimeCollection {
    toUTCStart: string;
    toUTCEnd: string;
}

/**
 * @interface DateTimeUtilImpl
 * @deprecated
 * @description
 * 다양한 날짜 라이브러리를 테스트 했지만 현재, 기본 Date를 사용하고 있습니다.
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

    toLocalDateTime(date: Date): LocalDateTime | null {
        if (!date) {
            return null;
        }

        return LocalDateTime.from(nativeJs(date));
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

    toUTCString(date: ZonedDateTime, zoneId: string): UTCTimeCollection {
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
}

export const DateTimeUtil = new InternalDataTimeUtil();
