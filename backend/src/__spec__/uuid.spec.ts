import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as validator from 'class-validator';

describe('create uuid v4', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test');
  });

  it('1', () => {
    const value: string = uuidv4();
    const normalizeUUID = value.replace(/[\-]+/g, '');

    logger.log(normalizeUUID); // 3d9eddd73e2647e894c4dc8091416312

    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
  it('2', () => {
    const value: string = uuidv4();
    const normalizeUUID = value.replace(/[\-]+/g, '');

    logger.log(normalizeUUID); // 3d9eddd73e2647e894c4dc8091416312

    expect(validator.isUUID(value, '4')).toBeTruthy();
  });
});
