import { Router } from 'express';
import authRoutes from './auth.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import hrRoutes from './hr.routes';
const router = Router();
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'WorkPulse API',
    version: '1.0.0',
  });
});
router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/hr', hrRoutes);

export default router;
