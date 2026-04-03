import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: [true, 'Please specify the type (Income or Expense)'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Record', recordSchema);
