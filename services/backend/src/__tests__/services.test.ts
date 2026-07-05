import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_ACCESS_EXPIRY = '15m';
  process.env.JWT_REFRESH_EXPIRY = '7d';
});

vi.mock('../config/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const { User } = vi.hoisted(() => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../models/User', () => ({ User }));

function mockQuery<T>(data: T) {
  const p = Promise.resolve(data) as Promise<T> & { select: ReturnType<typeof vi.fn> };
  p.select = vi.fn().mockReturnValue(p);
  return p;
}

import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/token.service';
import { registerUser, loginUser, refreshAccessToken, logoutUser, getMe } from '../services/auth.service';
import { UserRole } from '../types';

describe('Token Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a signed JWT with user payload', () => {
      const payload = { userId: '123', role: UserRole.WORKER };
      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-access-secret');
      expect(decoded).toMatchObject({ userId: '123', role: UserRole.WORKER });
    });

    it('should have an expiration', () => {
      const payload = { userId: '123', role: UserRole.WORKER };
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token) as { exp: number };
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a signed JWT with user payload', () => {
      const payload = { userId: '456', role: UserRole.ADMIN };
      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded).toMatchObject({ userId: '456', role: UserRole.ADMIN });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = { userId: '789', role: UserRole.SAFETY_OFFICER };
      const token = generateRefreshToken(payload);

      const decoded = verifyRefreshToken(token);
      expect(decoded).toMatchObject({ userId: '789', role: UserRole.SAFETY_OFFICER });
    });

    it('should throw on invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw on token signed with wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: '123', role: 'worker' },
        'wrong-secret',
        { expiresIn: '15m' },
      );
      expect(() => verifyRefreshToken(wrongToken)).toThrow();
    });
  });
});

describe('Auth Service', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'worker' as const,
    department: 'Safety',
    employeeId: 'EMP003',
    isActive: true,
    password: 'hashed-password',
    comparePassword: vi.fn(),
    save: vi.fn().mockResolvedValue(true),
    refreshToken: 'old-refresh-token',
    lastLogin: new Date(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    toJSON() {
      return {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        department: this.department,
        employeeId: this.employeeId,
        isActive: this.isActive,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    const validInput = {
      email: 'new@example.com',
      password: 'securePass1',
      firstName: 'New',
      lastName: 'User',
      department: 'Engineering',
      employeeId: 'EMP100',
    };

    it('should create a user and return user with tokens', async () => {
      User.findOne.mockReturnValue(mockQuery(null));
      const createdUser = { ...mockUser, ...validInput, password: undefined };
      User.create.mockResolvedValue(createdUser);

      const result = await registerUser(
        validInput.email,
        validInput.password,
        validInput.firstName,
        validInput.lastName,
        validInput.department,
        validInput.employeeId,
      );

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: validInput.email }, { employeeId: validInput.employeeId }],
      });
      expect(User.create).toHaveBeenCalledWith({
        email: validInput.email,
        password: validInput.password,
        firstName: validInput.firstName,
        lastName: validInput.lastName,
        department: validInput.department,
        employeeId: validInput.employeeId,
        role: 'worker',
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(validInput.email);
    });

    it('should throw 409 when email already exists', async () => {
      User.findOne.mockReturnValue(mockQuery(mockUser));

      await expect(
        registerUser(
          validInput.email,
          validInput.password,
          validInput.firstName,
          validInput.lastName,
          validInput.department,
          validInput.employeeId,
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('Email'),
      });
    });

    it('should throw 409 when employeeId already exists', async () => {
      User.findOne.mockReturnValue(mockQuery(mockUser));

      await expect(
        registerUser(
          'unique@example.com',
          validInput.password,
          validInput.firstName,
          validInput.lastName,
          validInput.department,
          'EMP003',
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('loginUser', () => {
    it('should return user and tokens with valid credentials', async () => {
      const loginUserData = {
        ...mockUser,
        comparePassword: vi.fn().mockResolvedValue(true),
        lastLogin: undefined,
      };
      User.findOne.mockImplementation(() => mockQuery(loginUserData));

      const result = await loginUser('jane@example.com', 'correct-password');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'jane@example.com' });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw 401 when user not found', async () => {
      User.findOne.mockImplementation(() => mockQuery(null));

      await expect(
        loginUser('unknown@example.com', 'any-password'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 when password is wrong', async () => {
      const loginUserData = {
        ...mockUser,
        comparePassword: vi.fn().mockResolvedValue(false),
      };
      User.findOne.mockImplementation(() => mockQuery(loginUserData));

      await expect(
        loginUser('jane@example.com', 'wrong-password'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 403 when account is deactivated', async () => {
      const deactivatedUser = {
        ...mockUser,
        isActive: false,
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockImplementation(() => mockQuery(deactivatedUser));

      await expect(
        loginUser('jane@example.com', 'correct-password'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new tokens with valid refresh token', async () => {
      const realToken = jwt.sign(
        { userId: mockUser._id, role: 'worker' },
        'test-refresh-secret',
        { expiresIn: '7d' },
      );

      const userWithToken = {
        ...mockUser,
        refreshToken: realToken,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findById.mockImplementation(() => mockQuery(userWithToken));

      const result = await refreshAccessToken(realToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw 401 when refresh token is invalid', async () => {
      await expect(
        refreshAccessToken('clearly-invalid-token'),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 when token does not match stored token', async () => {
      const realToken = jwt.sign(
        { userId: mockUser._id, role: 'worker' },
        'test-refresh-secret',
        { expiresIn: '7d' },
      );

      const userWithDifferentToken = {
        ...mockUser,
        refreshToken: 'different-token',
      };
      User.findById.mockImplementation(() => mockQuery(userWithDifferentToken));

      await expect(
        refreshAccessToken(realToken),
      ).rejects.toMatchObject({ statusCode: 401, message: expect.stringContaining('revoked') });
    });

    it('should throw 401 when user not found', async () => {
      const realToken = jwt.sign(
        { userId: 'nonexistent', role: 'worker' },
        'test-refresh-secret',
        { expiresIn: '7d' },
      );
      User.findById.mockImplementation(() => mockQuery(null));

      await expect(
        refreshAccessToken(realToken),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('logoutUser', () => {
    it('should clear refresh token', async () => {
      User.findByIdAndUpdate.mockResolvedValue({} as never);

      await logoutUser(mockUser._id);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, { refreshToken: null });
    });
  });

  describe('getMe', () => {
    it('should return user by id', async () => {
      User.findById.mockImplementation(() => mockQuery(mockUser));

      const result = await getMe(mockUser._id);

      expect(result).toBe(mockUser);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw 404 when user not found', async () => {
      User.findById.mockImplementation(() => mockQuery(null));

      await expect(getMe('nonexistent-id')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
