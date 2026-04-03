import AppError from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    //Zod error formatting
    const errObj = error.errors ? Object.values(error.errors).map(val => val.message).join(', ') : 'Validation Error';
    return next(new AppError(errObj, 400));
  }
};

export default validate;
