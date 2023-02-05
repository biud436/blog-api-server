import { Param, ParseIntPipe } from '@nestjs/common';

export const PostId = () => Param('id', ParseIntPipe);
