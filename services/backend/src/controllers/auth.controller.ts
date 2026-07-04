import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';
import { IAuthRequest } from '../types';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, department, employeeId } = req.body;
  const { user, accessToken, refreshToken } = await authService.registerUser(
    email,
    password,
    firstName,
    lastName,
    department,
    employeeId,
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: { user, accessToken, refreshToken },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

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
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User profile retrieved',
    data: { user: req.user },
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const resetToken = await authService.forgotPassword(email);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password reset link sent to email',
    data: { resetToken },
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;
  await authService.verifyEmail(token);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Email verified successfully',
  });
});

export const updateProfile = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { firstName, lastName, phone } = req.body;
  const user = await authService.updateProfile(req.user!.userId, { firstName, lastName, phone });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});
