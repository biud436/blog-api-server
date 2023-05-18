import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { PostTemp } from '../entities/post-temp.entity';

export class PostTempListItem {
    /**
     * 임시 포스트 ID
     */
    @ApiProperty()
    id!: number;

    /**
     * 임시 포스트 제목
     */
    @ApiProperty()
    title!: string;

    /**
     * 임시 포스트 생성 날짜
     */
    @ApiProperty()
    @IsDateString()
    createdAt!: Date;
}
