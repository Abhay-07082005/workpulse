import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { checkInSchema, checkOutSchema, attendanceFilterSchema } from '../validators/attendance.validator';
const router = Router();
router.use(authenticate);
router.post('/check-in', validateBody(checkInSchema), attendanceController.checkIn);
router.post('/check-out', validateBody(checkOutSchema), attendanceController.checkOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/my-attendance', validateQuery(attendanceFilterSchema), attendanceController.getMyAttendance);

export default router;
