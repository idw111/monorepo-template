import { hash, verify } from 'argon2';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';

import envvars from '@/configs/envvars';
import { User, UserRole } from '@/database/mysql/models/User';
import { throwHttpError } from '@/utils/error';
import { getSeconds } from '@/utils/time';

export interface UserPayload {
  id: number;
  email: string;
  role: UserRole;
  nickname: string;
}

export const extractUserPayload = (user: User): UserPayload => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nickname: user.nickname,
  };
};

export const extractAuthToken = (req: Request) => {
  return (req.headers.authorization || req.cookies.token)?.replace(/^Bearer/i, '').trim();
};

export const parseJwt = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractAuthToken(req);
  try {
    res.locals.user = jwt.verify(token, envvars.jwtSecret) as UserPayload;
  } catch {
    res.locals.user = null;
  }
  return next();
};

export const validatePassword = async (password: string, hashed: string): Promise<boolean> => {
  const valid = await verify(hashed, password);
  return valid;
};

export const hashPassword = async (password: string): Promise<string> => {
  const hashed = await hash(password);
  return hashed;
};

export const generateToken = (user: UserPayload): string =>
  jwt.sign(user, envvars.jwtSecret, {
    expiresIn: envvars.jwtExpire as ms.StringValue,
    issuer: envvars.jwtIssuer,
  });

export const authenticate = async (email: string, password: string): Promise<{ user: Partial<User>; token: string }> => {
  const user = await User.findOne({ where: { email } });
  if (!user) throwHttpError('Invalid email or password', 'Auth', 401);

  const isValidPassword = await validatePassword(password, user.password);
  if (!isValidPassword) throwHttpError('Invalid email or password', 'Auth', 401);

  const token = generateToken(extractUserPayload(user));
  return { user: user.toJSON(), token };
};

export const signupUser = async (
  email: string,
  password: string,
  nickname: string,
  role: UserRole = 'user'
): Promise<{ user: Partial<User>; token: string }> => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throwHttpError('Invalid email', 'Auth', 401);

  const hashed = await hashPassword(password);
  const user = await User.create({ email, password: hashed, nickname, role });

  const token = generateToken(extractUserPayload(user));
  return { user: user.toJSON(), token };
};

export const setTokenCookie = (res: Response, token: string): void => {
  const httpOnly = envvars.env === 'production';
  const secure = envvars.env === 'production';
  res.cookie('token', token, {
    maxAge: getSeconds(envvars.jwtExpire) * 1000,
    secure,
    httpOnly,
    domain: envvars.domain,
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie('token', { domain: envvars.domain });
};
