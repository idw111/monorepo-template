import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import envvars from '@/configs/envvars';
import { throwHttpError } from '@/utils/error';

const CSRF_COOKIE = 'x-csrf-token';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_SECRET_LENGTH = 32;

/**
 * CSRF 토큰 쿠키를 설정한다.
 * httpOnly: false — 클라이언트 JS가 쿠키 값을 읽어 요청 헤더에 실어야 한다.
 */
const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: envvars.env === 'production',
    sameSite: 'strict',
    domain: envvars.domain,
  });
};

/**
 * Double-Submit Cookie 패턴 CSRF 방어 미들웨어
 *
 * 흐름:
 *  1. 클라이언트가 GET 요청을 보내면 서버가 CSRF 토큰 쿠키를 내려준다.
 *  2. 클라이언트는 쿠키 값을 읽어 X-CSRF-Token 헤더에 담아 state-changing 요청을 보낸다.
 *  3. 미들웨어는 쿠키 값과 헤더 값을 비교하여 일치하지 않으면 403을 반환한다.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method.toUpperCase();

  // safe methods — 쿠키가 없으면 생성, 있으면 그대로 통과
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    if (!req.cookies[CSRF_COOKIE]) setCsrfCookie(res, crypto.randomBytes(CSRF_SECRET_LENGTH).toString('hex'));
    return next();
  }

  // state-changing methods — 쿠키-헤더 일치 여부 검증
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;
  if (!cookieToken || !headerToken || cookieToken !== headerToken) throwHttpError('CSRF token mismatch', 'Security', 403);

  return next();
};

/**
 * 요청 제한 미들웨어
 *
 * 흐름:
 *  1. 요청이 들어오면 60초 동안 최대 60번의 요청만 허용한다.
 *  2. 요청이 초과되면 429 상태 코드를 반환한다.
 *  3. 요청이 초과되면 60초 후에 다시 요청할 수 있다.
 */
const rateLimitMessage = { statusCode: 429, type: 'RateLimit', message: 'Too many requests' };

/** 일반 API용 — 분당 60회 */
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

/** 인증용 — 분당 10회 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});
