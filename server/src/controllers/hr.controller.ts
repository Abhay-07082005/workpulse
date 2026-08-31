import { Request, Response, NextFunction } from 'express';
import { hrService } from '../services/hr.service';
export class HRController {
  public async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await hrService.getDashboardMetrics();
      const trends = await hrService.getAttendanceTrends(7);
      const departmentStats = await hrService.getDepartmentBreakdown();
      return res.json({
        success: true,
        data: {
          metrics,
          trends,
          departmentStats,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch HR dashboard data',
      });
    }
  }
  public async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await hrService.getEmployees();
      return res.json({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch employee list',
      });
    }
  }
  public async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        startDate,
        endDate,
        status,
        department,
        employeeId,
        search,
        page,
        limit,
        format,
      } = req.query as any;
      if (format === 'csv') {
        const result = (await hrService.getAllAttendance({
          startDate,
          endDate,
          status,
          department,
          employeeId,
          search,
          exportCSV: true,
        })) as { csv?: string };

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_export_${Date.now()}.csv`);
        return res.send(result.csv);
      }
      const result = await hrService.getAllAttendance({
        startDate,
        endDate,
        status,
        department,
        employeeId,
        search,
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
        error: error.message || 'Failed to fetch attendance data',
      });
    }
  }
}
export const hrController = new HRController();
