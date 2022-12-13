import { DateTimeUtil } from '../libs/date/DateTimeUtil';

describe('시간 테스트', () => {
    it('JWT 시간 더하기 테스트', () => {
        const time = '1d 1h';

        const d = DateTimeUtil.extractJwtExpirationTime(time);

        console.log(d);

        expect(DateTimeUtil.toDate(d)).toBeInstanceOf(Date);
    });
});
