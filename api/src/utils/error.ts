import { NextFunction, Request, Response } from 'express';

type ErrorStatusCode = 400 | 401 | 403 | 404 | 500;

class HttpError extends Error {
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
  console.error(err);
  return next(err);
};

export const handleRenderError = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err instanceof HttpError ? err.statusCode : err.name === 'EntityNotFound' ? 404 : 500;
  res.status(statusCode).json({ statusCode, type: err.name, message: err.message });
};
