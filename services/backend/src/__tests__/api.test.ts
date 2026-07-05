import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.hoisted(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

vi.mock('express-rate-limit', () => ({
  default: vi.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
}));

vi.mock('swagger-ui-express', () => ({
  default: {
    serve: [],
    setup: vi.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
  },
}));

vi.mock('../config/swagger', () => ({
  swaggerSpec: {},
}));

vi.mock('../config/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

function query<T>(result: T) {
  const p = Promise.resolve(result) as Promise<T> & {
    select: ReturnType<typeof vi.fn>;
    sort: ReturnType<typeof vi.fn>;
    skip: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    lean: ReturnType<typeof vi.fn>;
    populate: ReturnType<typeof vi.fn>;
    exec: ReturnType<typeof vi.fn>;
  };
  p.select = vi.fn().mockReturnValue(p);
  p.sort = vi.fn().mockReturnValue(p);
  p.skip = vi.fn().mockReturnValue(p);
  p.limit = vi.fn().mockReturnValue(p);
  p.lean = vi.fn().mockReturnValue(p);
  p.populate = vi.fn().mockReturnValue(p);
  p.exec = vi.fn().mockReturnValue(p);
  return p;
}

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'worker',
  department: 'Engineering',
  employeeId: 'EMP001',
  isActive: true,
  isEmailVerified: false,
  refreshToken: 'mock-refresh-token',
  password: 'hashed-password',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  comparePassword: vi.fn(),
  save: vi.fn().mockResolvedValue(true),
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
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

const mockIncident = {
  _id: '507f1f77bcf86cd799439012',
  title: 'Chemical Spill',
  description: 'Spill in zone A',
  type: 'hazard',
  severity: 'high',
  status: 'reported',
  location: { type: 'Point', coordinates: [10, 20] },
  reportedBy: mockUser._id,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const { User } = vi.hoisted(() => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

const { Incident } = vi.hoisted(() => ({
  Incident: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('../models/User', () => ({ User }));
vi.mock('../models/Incident', () => ({ Incident }));

vi.mock('../config/redis', () => ({
  getRedis: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    scan: vi.fn(),
  })),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
    verify: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => 'hashed-password'),
    compare: vi.fn(),
  },
}));

import app from '../app';

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 with server health info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('GuardianAI');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    const validPayload = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Safety',
      employeeId: 'EMP002',
    };

    it('should register a new user and return 201', async () => {
      User.findOne.mockReturnValue(query(null));
      User.create.mockResolvedValue({
        ...mockUser,
        email: validPayload.email,
        firstName: validPayload.firstName,
        lastName: validPayload.lastName,
        department: validPayload.department,
        employeeId: validPayload.employeeId,
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-jwt-token');
      expect(res.body.data.user.email).toBe(validPayload.email);
    });

    it('should return 409 when email or employeeId already exists', async () => {
      User.findOne.mockReturnValue(query(mockUser));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const credentials = { email: 'john@example.com', password: 'password123' };

    it('should login with valid credentials and return 200 with tokens', async () => {
      const loginUser = {
        ...mockUser,
        comparePassword: vi.fn().mockResolvedValue(true),
        lastLogin: undefined,
      };
      User.findOne.mockReturnValue(query(loginUser));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-jwt-token');
    });

    it('should return 401 with invalid credentials', async () => {
      const userWithWrongPassword = {
        ...mockUser,
        comparePassword: vi.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue(query(userWithWrongPassword));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('should return 401 when user not found', async () => {
      User.findOne.mockReturnValue(query(null));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return user profile with valid token', async () => {
      const jwt = await import('jsonwebtoken');
      vi.mocked(jwt.default.verify).mockReturnValue({
        userId: mockUser._id,
        role: 'worker',
      } as never);
      User.findById.mockReturnValue(query(mockUser));

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-jwt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(mockUser.email);
    });
  });

  describe('GET /api/v1/incidents', () => {
    it('should return paginated incidents', async () => {
      const jwt = await import('jsonwebtoken');
      vi.mocked(jwt.default.verify).mockReturnValue({
        userId: mockUser._id,
        role: 'worker',
      } as never);

      Incident.countDocuments.mockResolvedValue(1);
      Incident.find.mockReturnValue(query([mockIncident]));

      const res = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', 'Bearer valid-jwt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('404 for unknown routes', () => {
    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
    });

    it('should return 404 for unknown non-API routes', async () => {
      const res = await request(app).get('/some-random-path');
      expect(res.status).toBe(404);
    });
  });
});
