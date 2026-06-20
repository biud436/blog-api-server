import { Role } from 'src/common/decorators/authorization/role.enum';
import { User } from 'src/domain/user/user.entity';

export interface JwtPayload {
  user: { username: Partial<User>['username'] };
  role?: string;
}
