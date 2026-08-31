import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { CONFIG } from '../config/constants';
export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.register(req.body);
      res.cookie(CONFIG.COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: { user, token },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.cookie(CONFIG.COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user, token },
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }
  public async logout(req: Request, res: Response) {
    res.clearCookie(CONFIG.COOKIE_NAME);
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const data = await authService.getMe(req.user.id);
      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: error.message || 'User not found',
      });
    }
  }
  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to update profile',
      });
    }
  }
}
export const authController = new AuthController();
