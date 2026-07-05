import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';
import { IAuthRequest } from '../types';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  });
});

export const logout = catchAsync(async (req: IAuthRequest, res: Response) => {
  await authService.logoutUser(req.user!.userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const me = catchAsync(async (req: IAuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User profile retrieved',
    data: { user },
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.generatePasswordResetOtp(email);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'If the email exists, an OTP has been sent',
  });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await authService.verifyOtp(email, otp);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  await authService.resetPasswordWithOtp(email, otp, password);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password reset successfully',
  });
});
