import { DateTimeUtil } from '../utils/DateTimeUtil';

describe('시간 테스트', () => {
  it('JWT 시간 더하기 테스트', () => {
    let time = '1d 1h';

    const d = DateTimeUtil.extractJwtExpirationTime(time);

    console.log(d);

    expect(DateTimeUtil.toDate(d)).toBeInstanceOf(Date);
  });
});
