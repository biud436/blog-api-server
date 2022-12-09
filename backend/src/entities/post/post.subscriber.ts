import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import removeMarkdown from 'markdown-to-text';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    LoadEvent,
} from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return Post;
    }

    async afterLoad(post: Post): Promise<void> {
        post.previewContent = removeMarkdown(post.content)?.slice(0, 100);
        // post.previewContent = post.previewContent?.replace(
        //     /(\r\n|\n|\r)/gm,
        //     '',
        // );
    }
}
