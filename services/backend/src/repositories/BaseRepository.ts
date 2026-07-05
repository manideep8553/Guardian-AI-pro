import { Model, Document, FilterQuery, QueryOptions, UpdateQuery, PipelineStage, Types } from 'mongoose';
import { IPaginationQuery } from '../types';
import { getOrSetCache, invalidateCache, CacheTTL } from '../services/cache.service';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  filter?: FilterQuery<unknown>;
  options?: QueryOptions;
  pagination?: IPaginationQuery;
  populate?: string | string[];
  select?: string;
}

export class BaseRepository<T extends Document> {
  protected model: Model<T>;
  protected cachePrefix: string;

  constructor(model: Model<T>, cachePrefix: string) {
    this.model = model;
    this.cachePrefix = cachePrefix;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    await invalidateCache(this.cachePrefix);
    return doc;
  }

  async findById(id: string | Types.ObjectId, queryParams?: QueryParams): Promise<T | null> {
    const cacheId = `byId:${id.toString()}`;
    const populate = queryParams?.populate;
    const select = queryParams?.select;

    return getOrSetCache<T | null>(
      this.cachePrefix,
      cacheId,
      async () => {
        let query = this.model.findById(id);
        if (populate) query = query.populate(populate);
        if (select) query = query.select(select);
        return query.lean<T | null>({ virtuals: true }) as unknown as T | null;
      },
      CacheTTL.MEDIUM,
    );
  }

  async findOne(filter: FilterQuery<T>, queryParams?: QueryParams): Promise<T | null> {
    const populate = queryParams?.populate;
    const select = queryParams?.select;
    let query = this.model.findOne(filter);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return query.lean<T | null>({ virtuals: true }) as unknown as T | null;
  }

  async findPaginated(queryParams: QueryParams): Promise<PaginatedResult<T>> {
    const { filter = {}, pagination = { page: 1, limit: 20 }, populate, select } = queryParams;
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;
    const sortField = pagination.sort || 'createdAt';
    const sortOrder = pagination.order === 'asc' ? 1 : -1;

    const cacheId = `list:${JSON.stringify(filter)}:${page}:${limit}:${sortField}:${sortOrder}`;

    return getOrSetCache<PaginatedResult<T>>(
      this.cachePrefix,
      cacheId,
      async () => {
        const [data, total] = await Promise.all([
          this.model
            .find(filter as FilterQuery<T>)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate(populate || [])
            .select(select || '')
            .lean<T[]>({ virtuals: true }),
          this.model.countDocuments(filter as FilterQuery<T>),
        ]);
        return {
          data: data as unknown as T[],
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      CacheTTL.SHORT,
    );
  }

  async findAll(filter: FilterQuery<T> = {}, queryParams?: QueryParams): Promise<T[]> {
    const populate = queryParams?.populate;
    const select = queryParams?.select;
    let query = this.model.find(filter as FilterQuery<T>);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return query.lean<T[]>({ virtuals: true }) as unknown as T[];
  }

  async updateById(id: string | Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean<T | null>({ virtuals: true });
    await invalidateCache(this.cachePrefix);
    return doc as unknown as T | null;
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    const doc = await this.model
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .lean<T | null>({ virtuals: true });
    await invalidateCache(this.cachePrefix);
    return doc as unknown as T | null;
  }

  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number> {
    const result = await this.model.updateMany(filter, update);
    await invalidateCache(this.cachePrefix);
    return result.modifiedCount;
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    const doc = await this.model.findByIdAndDelete(id).lean<T | null>({ virtuals: true });
    await invalidateCache(this.cachePrefix);
    return doc as unknown as T | null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter);
    await invalidateCache(this.cachePrefix);
    return result.deletedCount;
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter as FilterQuery<T>);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    return this.model.exists(filter as FilterQuery<T>).then(Boolean);
  }

  async aggregate(pipeline: PipelineStage[]): Promise<unknown[]> {
    return this.model.aggregate(pipeline);
  }

  async paginatedAggregate(
    pipeline: PipelineStage[],
    pagination: IPaginationQuery = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<unknown>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    const [countResult, data] = await Promise.all([
      this.model.aggregate(countPipeline),
      this.model.aggregate(dataPipeline),
    ]);

    const total = (countResult[0]?.total as number) || 0;

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async bulkWrite(operations: import('mongoose').AnyBulkWriteOperation[]): Promise<import('mongoose').mongo.BulkWriteResult> {
    const result = await this.model.bulkWrite(operations);
    await invalidateCache(this.cachePrefix);
    return result;
  }

  async createMany(docs: Partial<T>[]): Promise<T[]> {
    const created = await this.model.insertMany(docs, { ordered: false });
    await invalidateCache(this.cachePrefix);
    return created as unknown as T[];
  }

  clearCache(): Promise<void> {
    return invalidateCache(this.cachePrefix);
  }
}

export function buildFilterFromQuery(query: Record<string, unknown>): FilterQuery<unknown> {
  const filter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (key === 'search') {
      filter.$or = [
        { name: { $regex: value, $options: 'i' } },
        { title: { $regex: value, $options: 'i' } },
        { description: { $regex: value, $options: 'i' } },
      ];
    } else if (key.endsWith('_gte')) {
      const field = key.slice(0, -4);
      filter[field] = { ...(filter[field] as Record<string, unknown> || {}), $gte: Number(value) };
    } else if (key.endsWith('_lte')) {
      const field = key.slice(0, -4);
      filter[field] = { ...(filter[field] as Record<string, unknown> || {}), $lte: Number(value) };
    } else if (key.endsWith('_min')) {
      const field = key.slice(0, -4);
      filter[field] = { ...(filter[field] as Record<string, unknown> || {}), $gte: new Date(value as string) };
    } else if (key.endsWith('_max')) {
      const field = key.slice(0, -4);
      filter[field] = { ...(filter[field] as Record<string, unknown> || {}), $lte: new Date(value as string) };
    } else if (key === 'startDate') {
      filter.createdAt = { ...(filter.createdAt as Record<string, unknown> || {}), $gte: new Date(value as string) };
    } else if (key === 'endDate') {
      filter.createdAt = { ...(filter.createdAt as Record<string, unknown> || {}), $lte: new Date(value as string) };
    } else if (value !== undefined && value !== '' && value !== null) {
      filter[key] = value;
    }
  }
  return filter;
}
