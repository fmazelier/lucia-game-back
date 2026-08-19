import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/** Au-delà, l'URL est tronquée : inutile de polluer les logs avec un query string géant. */
const MAX_URL_LENGTH = 200;

/** L'URL vient du client : on retire les caractères de contrôle pour éviter l'injection de fausses lignes de log. */
function sanitizeUrl(url: string): string {
  // eslint-disable-next-line no-control-regex
  return url.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_URL_LENGTH);
}

/**
 * Journal d'accès HTTP : sans lui, les logs CapRover ne montrent que le démarrage de l'app.
 * Une ligne par requête terminée, y compris les 404 et les erreurs non gérées.
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const message = `${req.method} ${sanitizeUrl(req.originalUrl)} ${res.statusCode} ${durationMs.toFixed(0)}ms - ${req.ip ?? '-'}`;

      if (res.statusCode >= 500) {
        this.logger.error(message);
      } else if (res.statusCode >= 400) {
        this.logger.warn(message);
      } else if (req.path === '/health') {
        // Le healthcheck Docker tape toutes les 30 s : en niveau normal il noierait les vrais logs.
        this.logger.verbose(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
