import { NextFunction, Request, Response } from 'express';
import envvars from '@/configs/envvars';
import { logger } from '@/utils/logger';

type ErrorStatusCode = 400 | 401 | 403 | 404 | 500;

export class HttpError extends Error {
  public statusCode: ErrorStatusCode;
  constructor(message: string, name?: string, statusCode?: ErrorStatusCode) {
    super(message);
    this.name = name ?? '';
    this.statusCode = statusCode ?? 500;
  }
}

export const throwHttpError = (message: string, name?: string, statusCode?: ErrorStatusCode): never => {
  const err = new HttpError(message, name, statusCode);
  throw err;
};

export const handleNotFound = (req: Request, res: Response, next: NextFunction): void => {
  return next(new HttpError('404 Not Found', 'NotFound', 404));
};

export const handleReportError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // report err to somewhere (slack)
  logger().error(
    {
      name: err.name,
      message: err.message,
      statusCode: err instanceof HttpError ? err.statusCode : undefined,
      method: req.method,
      url: req.originalUrl,
    },
    'unhandled error'
  );
  return next(err);
};

export const handleRenderError = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const isHttpError = err instanceof HttpError;
  const statusCode = isHttpError ? err.statusCode : err.name === 'EntityNotFound' ? 404 : 500;
  // 의도하지 않은 500 에러의 내부 메시지는 프로덕션에서 노출하지 않는다
  const message = !isHttpError && statusCode === 500 && envvars.env === 'production' ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({ statusCode, type: err.name, message });
};
