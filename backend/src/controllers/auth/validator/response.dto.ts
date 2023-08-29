import { Role } from 'src/common/decorators/authorization/role.enum';
import { User } from 'src/entities/user/entities/user.entity';

export interface JwtPayload {
    user: { username: Partial<User>['username'] };
    role?: string;
}
