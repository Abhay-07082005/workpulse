import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { db } from '../config/db';
import { AuthTokenPayload, UserEntity } from '../types';
import { CONFIG } from '../config/constants';
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
      tokenPayload?: AuthTokenPayload;
    }
  }
}
export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  if (req.cookies && req.cookies[CONFIG.COOKIE_NAME]) {
    token = req.cookies[CONFIG.COOKIE_NAME];
  }
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }
  const user = db.findUserById(payload.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'User account not found or deactivated.',
    });
  }
  req.user = user;
  req.tokenPayload = payload;
  next();
}
