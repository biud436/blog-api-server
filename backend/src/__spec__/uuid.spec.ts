import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('create uuid v4', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test');
  });

  it('should create a uuid v4', () => {
    const value: string = uuidv4();
    const normalizeUUID = value.replace(/[\-]+/g, '');

    logger.log(normalizeUUID); // 3d9eddd73e2647e894c4dc8091416312
    logger.log(normalizeUUID.length); // 32 bytes

    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
