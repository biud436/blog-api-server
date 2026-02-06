import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsNullable } from 'src/common/decorators/validation/is-nullable.decorator';

export class CreateCommentDto {
  /**
   * @title 포스트 ID
   */
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  postId!: number;

  /**
   * @title 내용
   */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  /**
   * @title 위치
   */
  @ApiProperty()
  @IsNumber()
  @IsNullable()
  pos?: number;

  /**
   * @title 깊이
   */
  @ApiProperty()
  @IsNumber()
  @IsNullable()
  depth?: number;

  /**
   * 부모 댓글이 없다면, 조상 댓글 ID와 같은 값을 가짐
   * @title 부모 댓글 ID
   */
  @ApiProperty()
  @IsNumber()
  @IsNullable()
  parentId?: number;
}
