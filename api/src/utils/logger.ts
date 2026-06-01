import morgan from 'morgan';
import pino, { Logger } from 'pino';

let _logger: Logger | null = null;

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
};

/** 애플리케이션 로거 반환 (미초기화 시 fallback으로 console 반환) */
export const logger = (): Logger => _logger ?? (console as unknown as Logger);

/** HTTP 요청 로거 미들웨어 (morgan) */
export const getHttpLogger = () => {
  const isDev = !_logger || _logger.level === 'debug';
  return isDev ? morgan('dev') : morgan('combined');
};
