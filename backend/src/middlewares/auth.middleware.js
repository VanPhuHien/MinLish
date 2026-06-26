import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { COMMON, AUTH } from '../constants/codes/index.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(COMMON.UNAUTHORIZED, 401));
  }

  try {
    const decoded = verifyToken(token);

    if (decoded.type !== 'ACCESS') {
      return next(new AppError(AUTH.INVALID_TOKEN, 401));
    }

    const user = await User.findById(decoded.id).select('isActive passwordChangedAt');
    if (!user || !user.isActive) {
      return next(new AppError(AUTH.ACCOUNT_BANNED, 401));
    }

    if (
      user.passwordChangedAt &&
      decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
    ) {
      return next(new AppError(AUTH.INVALID_TOKEN, 401));
    }

    req.user = decoded; // { id, role, ... }
    next();
  } catch (error) {
    return next(new AppError(AUTH.INVALID_TOKEN, 401));
  }
};

// Optional auth: attach req.user when a valid Bearer token is present, but never reject. Missing/invalid/expired token anonymous request.
export const protectOptional = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.type === 'ACCESS') {
      const user = await User.findById(decoded.id).select('isActive passwordChangedAt');
      if (user && user.isActive) {
        if (!user.passwordChangedAt || decoded.iat >= Math.floor(user.passwordChangedAt.getTime() / 1000)) {
          req.user = decoded;
        }
      }
    }
  } catch (error) {
    // Ignore invalid/expired token; proceed as anonymous.
  }

  return next();
};
