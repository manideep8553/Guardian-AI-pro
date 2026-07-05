import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

interface MockSchemaField {
  type: unknown;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  enum?: string[];
  minlength?: number;
  select?: boolean;
  lowercase?: boolean;
  trim?: boolean;
  index?: boolean;
  ref?: string;
}

interface MockSchemaRecord {
  paths: Record<string, MockSchemaField>;
  preHooks: Record<string, (...args: unknown[]) => unknown>;
  methods: Record<string, (...args: unknown[]) => unknown>;
  statics: Record<string, (...args: unknown[]) => unknown>;
  indexes: Array<{ fields: Record<string, unknown>; options?: unknown }>;
  options: Record<string, unknown>;
}

const schemas: Record<string, MockSchemaRecord> = {};

vi.mock('mongoose', () => {
  class MockSchema {
    paths: Record<string, MockSchemaField> = {};
    preHooks: Record<string, (...args: unknown[]) => unknown> = {};
    methods: Record<string, (...args: unknown[]) => unknown> = {};
    statics: Record<string, (...args: unknown[]) => unknown> = {};
    indexes: Array<{ fields: Record<string, unknown>; options?: unknown }> = [];
    options: Record<string, unknown>;
    tree: Record<string, unknown>;

    constructor(def: Record<string, unknown>, opts?: Record<string, unknown>) {
      this.tree = def;
      this.options = opts || {};
      if (def) {
        for (const [key, val] of Object.entries(def)) {
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const field = val as Record<string, unknown>;
            if (field.type || field.ref) {
              this.paths[key] = {
                type: field.type,
                required: field.required === true,
                unique: field.unique === true,
                default: field.default,
                enum: field.enum as string[] | undefined,
                minlength: field.minlength as number | undefined,
                select: field.select === false,
                lowercase: field.lowercase === true,
                trim: field.trim === true,
                index: field.index === true,
                ref: field.ref as string | undefined,
              };
            }
          }
        }
      }
    }

    pre(event: string, fn: (...args: unknown[]) => unknown) { this.preHooks[event] = fn; }
    method(name: string, fn: (...args: unknown[]) => unknown) { this.methods[name] = fn; }
    static(name: string, fn: (...args: unknown[]) => unknown) { this.statics[name] = fn; }
    index(fields: Record<string, unknown>, options?: unknown) { this.indexes.push({ fields, options }); }
    path(name: string) { return this.paths[name] || null; }
    eachPath(fn: (k: string, v: MockSchemaField) => void) { Object.entries(this.paths).forEach(([k, v]) => fn(k, v)); }
    remove(path: string) { delete this.paths[path]; }
    static Types = { ObjectId: 'ObjectId' };
  }

  const mockModel = (name: string, schema?: MockSchema) => {
    if (schema) {
      schemas[name] = {
        paths: schema.paths,
        preHooks: schema.preHooks,
        methods: schema.methods,
        statics: schema.statics,
        indexes: schema.indexes,
        options: schema.options,
      };
    }
    const chainable = () => chainable;
    chainable.select = vi.fn().mockReturnThis();
    chainable.sort = vi.fn().mockReturnThis();
    chainable.skip = vi.fn().mockReturnThis();
    chainable.limit = vi.fn().mockReturnThis();
    chainable.lean = vi.fn().mockReturnThis();
    chainable.populate = vi.fn().mockReturnThis();
    chainable.findOne = vi.fn().mockReturnValue(chainable);
    chainable.findById = vi.fn().mockReturnValue(chainable);
    chainable.create = vi.fn();
    chainable.findByIdAndUpdate = vi.fn();
    chainable.findByIdAndDelete = vi.fn();
    chainable.countDocuments = vi.fn();
    chainable.find = vi.fn().mockReturnValue(chainable);
    chainable.deleteMany = vi.fn();
    chainable.aggregate = vi.fn();
    chainable.schema = schema || new MockSchema({});
    return chainable;
  };

  return {
    default: {
      Schema: MockSchema,
      model: mockModel,
      Types: { ObjectId: 'ObjectId' },
      set: vi.fn(),
      connect: vi.fn(),
      connection: { on: vi.fn() },
    },
    Schema: MockSchema,
    model: mockModel,
    Types: { ObjectId: 'ObjectId', SchemaTypes: { ObjectId: 'ObjectId' } },
    set: vi.fn(),
    connect: vi.fn(),
    Document: class {},
    connection: { on: vi.fn() },
  };
});

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((pw: string) => `hashed_${pw}`),
    compare: vi.fn((pw: string, hashed: string) => pw === hashed.replace('hashed_', '')),
  },
  hash: vi.fn((pw: string) => `hashed_${pw}`),
  compare: vi.fn((pw: string, hashed: string) => pw === hashed.replace('hashed_', '')),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('User Model', () => {
  beforeAll(async () => {
    await import('../models/User');
  });

  it('should define all required fields', () => {
    const userSchema = schemas['User'];
    expect(userSchema).toBeDefined();

    expect(userSchema.paths.email).toBeDefined();
    expect(userSchema.paths.email.required).toBe(true);
    expect(userSchema.paths.email.unique).toBe(true);
    expect(userSchema.paths.email.lowercase).toBe(true);

    expect(userSchema.paths.password).toBeDefined();
    expect(userSchema.paths.password.required).toBe(true);
    expect(userSchema.paths.password.select).toBe(true);
    expect(userSchema.paths.password.minlength).toBe(8);

    expect(userSchema.paths.firstName).toBeDefined();
    expect(userSchema.paths.firstName.required).toBe(true);

    expect(userSchema.paths.lastName).toBeDefined();
    expect(userSchema.paths.lastName.required).toBe(true);

    expect(userSchema.paths.employeeId).toBeDefined();
    expect(userSchema.paths.employeeId.required).toBe(true);
    expect(userSchema.paths.employeeId.unique).toBe(true);
  });

  it('should default role to worker', () => {
    const userSchema = schemas['User'];
    expect(userSchema.paths.role.default).toBe('worker');
  });

  it('should default isActive to true', () => {
    const userSchema = schemas['User'];
    expect(userSchema.paths.isActive.default).toBe(true);
  });

  it('should have refreshToken excluded from JSON by default (select: false)', () => {
    const userSchema = schemas['User'];
    expect(userSchema.paths.refreshToken.select).toBe(true);
  });

  it('should have pre-save hook for password hashing', () => {
    const userSchema = schemas['User'];
    expect(userSchema.preHooks.save).toBeDefined();
    expect(typeof userSchema.preHooks.save).toBe('function');
  });

  it('should have comparePassword method', () => {
    const userSchema = schemas['User'];
    expect(userSchema.methods.comparePassword).toBeDefined();
    expect(typeof userSchema.methods.comparePassword).toBe('function');
  });

  it('should hash password in pre-save hook', async () => {
    const userSchema = schemas['User'];
    const saveHook = userSchema.preHooks.save;

    const mockThis = {
      isModified: vi.fn((field: string) => field === 'password'),
      password: 'plain-text-pass',
    };
    const next = vi.fn();

    await saveHook.call(mockThis, next);

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-text-pass', 12);
    expect(next).toHaveBeenCalled();
  });

  it('should skip password hashing if password not modified', async () => {
    const userSchema = schemas['User'];
    const saveHook = userSchema.preHooks.save;

    const mockThis = {
      isModified: vi.fn(() => false),
      password: 'unchanged',
    };
    const next = vi.fn();

    await saveHook.call(mockThis, next);

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should have timestamps enabled', () => {
    const userSchema = schemas['User'];
    expect(userSchema.options.timestamps).toBe(true);
  });
});

describe('Incident Model', () => {
  beforeAll(async () => {
    await import('../models/Incident');
  });

  it('should define all required fields', () => {
    const incidentSchema = schemas['Incident'];
    expect(incidentSchema).toBeDefined();

    expect(incidentSchema.paths.title).toBeDefined();
    expect(incidentSchema.paths.title.required).toBe(true);

    expect(incidentSchema.paths.description).toBeDefined();
    expect(incidentSchema.paths.description.required).toBe(true);

    expect(incidentSchema.paths.type).toBeDefined();
    expect(incidentSchema.paths.type.required).toBe(true);

    expect(incidentSchema.paths.reportedBy).toBeDefined();
    expect(incidentSchema.paths.reportedBy.required).toBe(true);
  });

  it('should default status to reported', () => {
    const incidentSchema = schemas['Incident'];
    expect(incidentSchema.paths.status.default).toBe('reported');
  });

  it('should default severity to medium', () => {
    const incidentSchema = schemas['Incident'];
    expect(incidentSchema.paths.severity.default).toBe('medium');
  });

  it('should have timestamps enabled', () => {
    const incidentSchema = schemas['Incident'];
    expect(incidentSchema.options.timestamps).toBe(true);
  });

  it('should have geospatial index on location', () => {
    const incidentSchema = schemas['Incident'];
    const locationIndex = incidentSchema.indexes.find(
      (idx) => idx.fields.location === '2dsphere',
    );
    expect(locationIndex).toBeDefined();
  });

  it('should have compound index on status and severity', () => {
    const incidentSchema = schemas['Incident'];
    const compoundIndex = incidentSchema.indexes.find(
      (idx) => idx.fields.status === 1 && idx.fields.severity === 1,
    );
    expect(compoundIndex).toBeDefined();
  });

  it('should have index on reportedBy', () => {
    const incidentSchema = schemas['Incident'];
    const reportedByIndex = incidentSchema.indexes.find(
      (idx) => idx.fields.reportedBy === 1,
    );
    expect(reportedByIndex).toBeDefined();
  });
});
