import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
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
}
