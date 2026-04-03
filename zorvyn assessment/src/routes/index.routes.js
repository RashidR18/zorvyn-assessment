import express from 'express';
import authRoutes from './auth.routes.js';
import recordRoutes from './record.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

//Health check
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
