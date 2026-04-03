import Record from '../models/record.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const createRecord = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id; //Assign loggedin user to record

  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }

  const record = await Record.create(req.body);

  res.status(201).json({
    success: true,
    data: record,
  });
});

export const getRecords = catchAsync(async (req, res, next) => {
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude from normal matching
  const removeFields = ['select', 'sort', 'page', 'limit', 'startDate', 'endDate'];

  removeFields.forEach((param) => delete reqQuery[param]);

  //Handle Date filtering
  if (req.query.startDate || req.query.endDate) {
    reqQuery.date = {};
    if (req.query.startDate) {
      reqQuery.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      reqQuery.date.$lte = new Date(req.query.endDate);
    }
  }

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //We'll proceed with system wide.

  query = Record.find(JSON.parse(queryStr)).populate({
    path: 'user',
    select: 'name'
  });

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Record.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  //Execute query
  const records = await query;

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: records.length,
    pagination,
    data: records,
  });
});

export const getRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findById(req.params.id);

  if (!record) {
    return next(new AppError(`Record not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

export const updateRecord = catchAsync(async (req, res, next) => {
  let record = await Record.findById(req.params.id);

  if (!record) {
    return next(new AppError(`Record not found with id of ${req.params.id}`, 404));
  }

  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }

  record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: record,
  });
});

export const deleteRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findById(req.params.id);

  if (!record) {
    return next(new AppError(`Record not found with id of ${req.params.id}`, 404));
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
