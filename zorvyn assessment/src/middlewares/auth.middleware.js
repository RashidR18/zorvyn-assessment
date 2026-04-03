import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';

//Protect routes
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Setthe token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  //Make sure token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || (!user.isActive && req.originalUrl !== '/api/auth/logout')) {
      return next(new AppError('User not found or inactive', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

//Grant access to the specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
