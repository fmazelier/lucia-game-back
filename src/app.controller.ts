import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from './common/decorators/public.decorator';
import { currentDateInTimeZone } from './common/utils/date.util';
import {
  CALENDAR_END_DATE,
  CALENDAR_START_DATE,
} from './config/calendar.constants';
import { AppConfiguration } from './config/configuration';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  /**
   * GET /health
   * Sonde publique (healthcheck Docker) qui expose aussi la date serveur faisant foi
   * et les bornes du calendrier, pour l'écran d'attente du front.
   */
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      serverDate: currentDateInTimeZone(
        this.configService.get('timezone', { infer: true }),
      ),
      calendar: { startDate: CALENDAR_START_DATE, endDate: CALENDAR_END_DATE },
    };
  }
}
