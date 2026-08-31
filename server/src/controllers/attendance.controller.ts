import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
export class AttendanceController {
  public async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const result = await attendanceService.checkIn(employeeId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Checked in successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Check-in failed',
      });
    }
  }
  public async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const result = await attendanceService.checkOut(employeeId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Checked out successfully. Working hours recorded.',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Check-out failed',
      });
    }
  }
  public async getTodayAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const data = await attendanceService.getTodayAttendance(employeeId);
      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch today status',
      });
    }
  }
  public async getMyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const { startDate, endDate, status, page, limit } = req.query as any;
      const result = await attendanceService.getMyAttendance(employeeId, {
        startDate,
        endDate,
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch attendance history',
      });
    }
  }
}
export const attendanceController = new AttendanceController();
