import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserCopy } from 'src/entities/user-copy/entities/user-copy.entity';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return User;
    }

    afterInsert(event: InsertEvent<User>): void | Promise<any> {
        const userCopy = new UserCopy();

        userCopy.username = event.entity.username;

        event.queryRunner.manager.save(userCopy);
    }
}
