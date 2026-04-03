import { z } from 'zod';

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
    type: z.enum(['Income', 'Expense'], { required_error: 'Type is required, either Income or Expense' }),
    category: z.string({ required_error: 'Category is required' }).min(2, 'Category name too short'),
    date: z.string().optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.enum(['Income', 'Expense']).optional(),
    category: z.string().min(2, 'Category name too short').optional(),
    date: z.string().optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const filterRecordsSchema = z.object({
  query: z.object({
    type: z.enum(['Income', 'Expense']).optional(),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
