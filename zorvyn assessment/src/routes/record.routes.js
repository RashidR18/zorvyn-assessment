import express from 'express';
import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  createRecordSchema,
  updateRecordSchema,
  filterRecordsSchema,
} from '../validations/record.validation.js';

const router = express.Router();

router.use(protect);

//Routes for Analysts and Admins
router
  .route('/')
  .get(authorize('Analyst', 'Admin'), validate(filterRecordsSchema), getRecords)
  .post(authorize('Admin'), validate(createRecordSchema), createRecord);

router
  .route('/:id')
  .get(authorize('Analyst', 'Admin'), getRecord)
  .put(authorize('Admin'), validate(updateRecordSchema), updateRecord)
  .delete(authorize('Admin'), deleteRecord);

export default router;
