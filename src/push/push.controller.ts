import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  /**
   * GET /push/public-key
   * Clé VAPID publique à passer à `PushManager.subscribe()`.
   * Servie par l'API pour éviter de la dupliquer dans le build du front.
   */
  @Get('public-key')
  getPublicKey(): { publicKey: string } {
    if (!this.pushService.isEnabled()) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        code: 'PUSH_DISABLED',
        message: 'Les notifications push ne sont pas configurées.',
      });
    }
    return { publicKey: this.pushService.getPublicKey() };
  }

  /**
   * POST /push/subscribe
   * Corps = `subscription.toJSON()` du navigateur. Rejouable sans effet de bord.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto): Promise<void> {
    return this.pushService.subscribe(dto);
  }

  /** POST /push/unsubscribe — retire l'appareil de la liste de diffusion. */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('unsubscribe')
  unsubscribe(@Body() dto: UnsubscribeDto): Promise<void> {
    return this.pushService.unsubscribe(dto.endpoint);
  }

  /** POST /push/test — envoie une notification immédiate, pour valider l'installation. */
  @HttpCode(HttpStatus.OK)
  @Post('test')
  async sendTest(): Promise<{ sent: number }> {
    return { sent: await this.pushService.sendTest() };
  }
}
