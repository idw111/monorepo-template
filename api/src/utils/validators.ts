import { NextFunction, Request, Response } from 'express';
import { check, ValidationChain, ValidationError, validationResult } from 'express-validator';

import { UserRole } from '@/database/mysql/models/User';
import { throwHttpError } from '@/utils/error';

export const validateAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!res.locals.user) throwHttpError('Not authenticated', 'Auth', 401);
  return next();
};

export const validateRoles =
  (roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.user) throwHttpError('Not authenticated', 'Auth', 401);
    if (!roles.includes(res.locals.user.role)) throwHttpError('Not authorized', 'Auth', 403);
    return next();
  };

export const validate = (...validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.reduce(async (promise, validation) => {
      await promise;
      await validation.run(req);
    }, Promise.resolve());
    const err = validationResult(req);
    if (err.isEmpty()) return next();
    else {
      const error: ValidationError = err.array({ onlyFirstError: true })[0];
      const message = error?.msg ?? 'Invalid value';
      if (error.type === 'field') throwHttpError(`${message}: ${error.path}`, 'Validation', 400);
      throwHttpError(message, 'Validation', 400);
    }
  };
};

export const validateNumeric = (fields: string | string[]) => {
  if (typeof fields === 'string') return validateNumeric([fields]);
  else return validate(...fields.map((field) => check(field).isNumeric().toInt()));
};

export const validateText = (fields: string | string[]) => {
  if (typeof fields === 'string') return validateText([fields]);
  else return validate(...fields.map((field) => check(field).exists({ checkFalsy: true }).isString()));
};

export const validateArray = (fields: string | string[]) => {
  if (typeof fields === 'string') return validateArray([fields]);
  else
    return validate(
      ...fields.map((field) =>
        check(field).custom((value) => {
          if (!Array.isArray(value)) throw new Error('Invalid value');
          return true;
        })
      )
    );
};
