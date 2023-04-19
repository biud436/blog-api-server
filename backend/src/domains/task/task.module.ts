import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { PostViewCountModule } from 'src/entities/post-view-count/post-view-count.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MicroServicesModule,
        PostViewCountModule,
    ],
    providers: [TaskService],
})
export class TaskModule {}
