import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AppConfiguration } from '../config/configuration';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // `global: true` rend JwtService injectable partout, notamment dans le guard global.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        const auth = configService.get('auth', { infer: true });
        return {
          secret: auth.jwtSecret,
          // La valeur vient de l'environnement : le format `ms` est validé au runtime par jsonwebtoken.
          signOptions: {
            expiresIn: auth.jwtExpiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
