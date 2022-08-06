import { HttpModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/entities/user/user.module';
import { BasicStrategy } from './strategies/auth-basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminModule } from 'src/entities/admin/admin.module';
import { ProfileModule } from 'src/entities/profile/profile.module';
import { MicroServicesModule } from 'src/micro-services/micro-services.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { GithubStrategy } from './strategies/github.strategy';
import { UserCopy } from 'src/entities/user-copy/entities/user-copy.entity';
import { UserCopyModule } from 'src/entities/user-copy/user-copy.module';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';

@Module({
    imports: [
        UserModule,
        ConfigModule,
        AdminModule,
        ProfileModule,
        MicroServicesModule,
        MailModule,
        UserCopyModule,
        HttpModule,
        PassportModule.register({ defaultStrategy: 'jwt', session: true }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_SECRET_EXPIRATION_TIME'),
                    algorithm: 'HS384',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, ...AuthModule.strategies],
    exports: [AuthService],
})
export class AuthModule {
    /**
     * 인증 전략을 정의합니다.
     */
    static get strategies() {
        return [
            BasicStrategy,
            LocalStrategy,
            JwtStrategy,
            GithubStrategy,
            SessionSerializer,
        ];
    }
}
