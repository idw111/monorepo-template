import pino, { Logger } from 'pino';
import pinoHttp, { type HttpLogger } from 'pino-http';

let _logger: Logger | null = null;
let _httpLogger: HttpLogger | null = null;

/**
 * pino 로거를 초기화합니다. 서버 시작 시 한 번만 호출하세요.
 * @param options.isDev - 개발 환경 여부 (pino-pretty 활성화)
 */
export const initLogger = (options: { isDev: boolean }): void => {
  const { isDev } = options;

  _logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } : undefined,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  _httpLogger = pinoHttp({
    logger: _logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req: isDev ? (req) => req : pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  });
};

/** 애플리케이션 로거 반환 (미초기화 시 fallback으로 console 반환) */
export const logger = (): Logger => _logger ?? (console as unknown as Logger);

/** HTTP 요청 로거 미들웨어 (morgan 대체, 미초기화 시 null) */
export const getHttpLogger = (): HttpLogger | null => _httpLogger;
