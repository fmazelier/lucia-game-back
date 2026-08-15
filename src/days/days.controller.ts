import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { DaysService } from './days.service';
import { DayDateParamDto } from './dto/day-date-param.dto';
import {
  DayConfigResponse,
  DayStatusResponse,
  DaySummaryResponse,
  RewardResponse,
} from './dto/day-response.dto';

@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) {}

  /**
   * GET /days/today
   * Config du memory du jour : difficulté, grille et ids de photos (remélangés à chaque appel).
   * 403 CALENDAR_NOT_STARTED avant le 16/08/2026, 403 CALENDAR_FINISHED après le 10/09/2026.
   * La date est déterminée par le serveur : changer l'horloge du téléphone n'a aucun effet.
   */
  @Get('today')
  getToday(): Promise<DayConfigResponse> {
    return this.daysService.getTodayConfig();
  }

  /**
   * GET /days
   * Vue d'ensemble du calendrier (debug / admin).
   * Le type de récompense n'est révélé que pour les jours déjà complétés.
   */
  @Get()
  findAll(): Promise<DaySummaryResponse[]> {
    return this.daysService.findAll();
  }

  /**
   * GET /days/:date/config
   * Même charge utile que /days/today, pour rejouer un jour manqué.
   * 403 DAY_NOT_AVAILABLE_YET si la date est postérieure au jour courant serveur.
   */
  @Get(':date/config')
  getConfig(@Param() params: DayDateParamDto): Promise<DayConfigResponse> {
    return this.daysService.getDayConfig(params.date);
  }

  /**
   * POST /days/:date/complete
   * Marque le jour comme complété. Idempotent : un second appel renvoie le même statut
   * avec `justCompleted: false`. 403 si la date est postérieure au jour courant serveur.
   */
  @HttpCode(HttpStatus.OK)
  @Post(':date/complete')
  complete(@Param() params: DayDateParamDto): Promise<DayStatusResponse> {
    return this.daysService.completeDay(params.date);
  }

  /**
   * GET /days/:date/reward
   * Récompense du jour : renvoyée uniquement si `completed` est vrai, sinon 403 DAY_NOT_COMPLETED.
   */
  @Get(':date/reward')
  getReward(@Param() params: DayDateParamDto): Promise<RewardResponse> {
    return this.daysService.getReward(params.date);
  }
}
