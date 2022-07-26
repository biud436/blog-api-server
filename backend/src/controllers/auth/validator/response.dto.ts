import { Role } from 'src/decorators/role.enum';
import { User } from 'src/entities/user/entities/user.entity';

export interface JwtPayload {
    user: Partial<User>;
    role?: string;
}
