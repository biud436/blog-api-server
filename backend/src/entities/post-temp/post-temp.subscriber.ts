import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { PostTemp } from './entities/post-temp.entity';

/**
 * 포스트 임시 저장 이벤트 리스너
 */
@Injectable()
export class PostTempSubscriber implements EntitySubscriberInterface<PostTemp> {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return PostTemp;
    }

    afterInsert(event: InsertEvent<PostTemp>): void | Promise<any> {
        // empty
    }

    afterUpdate(event: UpdateEvent<PostTemp>): void | Promise<any> {
        // empty
    }
}
