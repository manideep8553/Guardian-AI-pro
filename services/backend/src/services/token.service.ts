import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IAuthPayload } from '../types';

export function generateAccessToken(payload: IAuthPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: IAuthPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): IAuthPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as IAuthPayload;
}
