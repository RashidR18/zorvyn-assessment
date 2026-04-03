import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

//Viewers can view the dashboard 
router.get('/analytics', authorize('Viewer', 'Analyst', 'Admin'), getDashboardSummary);

export default router;
