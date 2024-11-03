import { User } from 'src/entities/user/entities/user.entity';

export type ProfileUser = {
    user: Pick<User, 'username'>;
    role: string;
};
