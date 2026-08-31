import { z } from 'zod';

export const applyLeaveSchema = z.object({
  leaveType: z.enum(['CASUAL', 'SICK', 'ANNUAL', 'UNPAID']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid startDate format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid endDate format (YYYY-MM-DD)'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').max(500),
});

export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminComment: z.string().max(300).optional(),
});
