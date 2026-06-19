import { User } from 'src/domain/user/user.entity';

export type ProfileUser = {
  user: Pick<User, 'username'>;
  role: string;
};
