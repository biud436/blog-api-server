import { plainToClass, Transform, TransformFnParams } from 'class-transformer';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import * as moment from 'moment';
import { User } from 'src/entities/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({
        unique: true,
    })
    accessKey: string;

    @ApiProperty()
    @Column()
    isExpired: boolean;

    @ApiProperty()
    @Column({
        type: 'datetime',
    })
    @Transform((param: TransformFnParams) => moment(param.value))
    expiresAt: moment.Moment;

    @ApiProperty()
    @Column({
        name: 'user_id',
    })
    userId: number;

    @ManyToOne(() => User, (user) => user.apiKeys, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    static of(
        data: Omit<Partial<ApiKey>, 'expiresAt'> & {
            expiresAt: Date;
        },
    ): ApiKey {
        const instance = plainToClass(ApiKey, data);
        return instance;
    }
}
