import { Request, Response, NextFunction } from 'express';
import { leaveService } from '../services/leave.service';
export class LeaveController {
  public async applyLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const leave = await leaveService.applyLeave({
        employeeId,
        ...req.body,
      });
      return res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to submit leave application',
      });
    }
  }
  public async getMyLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user!.id;
      const data = await leaveService.getMyLeaves(employeeId);
      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch leaves',
      });
    }
  }
  public async getAllLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, department } = req.query as any;
      const leaves = await leaveService.getAllLeaves({ status, department });
      return res.json({
        success: true,
        data: leaves,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch leave requests',
      });
    }
  }
  public async reviewLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reviewerId = req.user!.id;
      const updatedLeave = await leaveService.reviewLeave(id, reviewerId, req.body);

      return res.json({
        success: true,
        message: `Leave request has been ${req.body.status.toLowerCase()} successfully`,
        data: updatedLeave,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to review leave request',
      });
    }
  }
}
export const leaveController = new LeaveController();
