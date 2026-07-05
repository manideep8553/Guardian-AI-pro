import httpStatus from 'http-status';
import crypto from 'crypto';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './token.service';
import { IAuthPayload } from '../types';

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Account is deactivated. Contact your admin.');
  }
  const payload: IAuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  let payload: IAuthPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token revoked');
  }
  const newPayload: IAuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(newPayload);
  const refreshToken = generateRefreshToken(newPayload);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
}

export async function generatePasswordResetOtp(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });
  console.log(`[DEV] OTP for ${email}: ${otp}`);
}

export async function verifyOtp(email: string, otp: string) {
  const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
  const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } }).select('+password');
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.refreshToken = null;
  await user.save();
}
