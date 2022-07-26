import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { UserCopy } from 'src/entities/user-copy/entities/user-copy.entity';
import {
    Connection,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
} from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(@InjectConnection() readonly connection: Connection) {
        connection.subscribers.push(this);
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
