import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { AppConfiguration } from '../config/configuration';
import { LoginDto } from './dto/login.dto';

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AppConfiguration, true>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Vérifie le couple login / PIN issu des variables d'environnement
   * (aucun utilisateur n'est stocké en base) puis émet le JWT longue durée.
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const auth = this.configService.get('auth', { infer: true });

    // Les deux comparaisons sont toujours exécutées : pas de fuite d'information par timing.
    const loginMatches = AuthService.safeEquals(dto.login, auth.login);
    const pinMatches = AuthService.safeEquals(dto.pin, auth.pin);

    if (!loginMatches || !pinMatches) {
      throw new UnauthorizedException('Identifiant ou code PIN incorrect.');
    }

    const payload: JwtPayload = { sub: auth.login };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: auth.jwtExpiresIn,
    };
  }

  /** Comparaison à temps constant, insensible à la différence de longueur. */
  private static safeEquals(candidate: string, expected: string): boolean {
    const candidateHash = createHash('sha256').update(candidate).digest();
    const expectedHash = createHash('sha256').update(expected).digest();
    return timingSafeEqual(candidateHash, expectedHash);
  }
}
