import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { Role } from '../constants/roles.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  fullName: string;
  facilityId?: string | null;
}

export class JwtUtil {
  public static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  public static generateRefreshToken(payload: { sub: string }): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  public static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  public static verifyRefreshToken(token: string): { sub: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  }
}
