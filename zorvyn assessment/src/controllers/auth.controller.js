import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

//Get the token from model,create cookie and send the response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //Check the user exists or not
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Viewer', //Default role Viewer
  });

  sendTokenResponse(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.isActive) {
    return next(new AppError('Invalid credentials', 401));
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

//Admin can update the roles and access
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
