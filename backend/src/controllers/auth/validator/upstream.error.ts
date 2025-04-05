import { InternalServerErrorException } from '@nestjs/common';

export class DownStreamInternalServerErrorException extends InternalServerErrorException {
  constructor(
    objectOrError?: string | Record<string, unknown> | any,
    description?: string,
  ) {
    super(objectOrError, description);
  }
}
