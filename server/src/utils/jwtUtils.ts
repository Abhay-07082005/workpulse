import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';
import { CONFIG } from '../config/constants';
export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN as any,
  });
}
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
