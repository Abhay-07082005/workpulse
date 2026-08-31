import { z } from 'zod';

export const checkInSchema = z.object({
  location: z.string().optional().default('Office HQ'),
  notes: z.string().max(250).optional(),
});

export const checkOutSchema = z.object({
  notes: z.string().max(250).optional(),
});

export const attendanceFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid startDate format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid endDate format (YYYY-MM-DD)').optional(),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'IN_PROGRESS', 'COMPLETED', 'ON_LEAVE', 'HALF_DAY']).optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
