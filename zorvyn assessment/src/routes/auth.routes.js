import express from 'express';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

//Admin routes
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
