import { Expose } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ConnectInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    userAgent: string;

    @CreateDateColumn()
    createdAt: Date;

    @Expose()
    get browsers(): string[] {
        const result: string[] = [];

        if (this.userAgent.includes('Chrome')) {
            result.push('Chrome');
        } else if (this.userAgent.includes('Firefox')) {
            result.push('Firefox');
        } else if (this.userAgent.includes('Safari')) {
            result.push('Safari');
        } else if (this.userAgent.includes('Edge')) {
            result.push('Edge');
        } else if (this.userAgent.includes('Opera')) {
            result.push('Opera');
        } else if (this.userAgent.includes('MSIE')) {
            result.push('Internet Explorer');
        } else {
            result.push('Unknown');
        }

        return result;
    }
}
