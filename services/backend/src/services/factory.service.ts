import httpStatus from 'http-status';
import { Factory } from '../models/Factory';
import { Building } from '../models/Building';
import { Floor } from '../models/Floor';
import { Zone } from '../models/Zone';
import { Department } from '../models/Department';
import { ApiError } from '../utils/ApiError';
import { ZoneType } from '../types';

interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  [key: string]: unknown;
}

export async function createFactory(data: Record<string, unknown>) {
  return Factory.create(data);
}

export async function getFactories(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [factories, total] = await Promise.all([
    Factory.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Factory.countDocuments(filter),
  ]);

  return {
    factories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFactoryById(id: string) {
  const factory = await Factory.findById(id);

  if (!factory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Factory not found');
  }

  const buildingCount = await Building.countDocuments({ factory: id });
  const result = factory.toObject();
  result.totalBuildings = buildingCount;

  return result;
}

export async function updateFactory(id: string, data: Record<string, unknown>) {
  const factory = await Factory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!factory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Factory not found');
  }

  return factory;
}

export async function deleteFactory(id: string) {
  const factory = await Factory.findByIdAndDelete(id);
  if (!factory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Factory not found');
  }

  await Building.deleteMany({ factory: id });
  return factory;
}

export async function createBuilding(data: Record<string, unknown>) {
  const building = await Building.create(data);

  await Factory.findByIdAndUpdate(data.factory, {
    $inc: { totalBuildings: 1 },
  });

  return building;
}

export async function getBuildings(query: PaginationQuery, factoryId?: string) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (factoryId) filter.factory = factoryId;

  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [buildings, total] = await Promise.all([
    Building.find(filter)
      .populate('factory', 'name code')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Building.countDocuments(filter),
  ]);

  return {
    buildings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBuildingById(id: string) {
  const building = await Building.findById(id).populate('factory', 'name code');

  if (!building) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
  }

  return building;
}

export async function updateBuilding(id: string, data: Record<string, unknown>) {
  const building = await Building.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!building) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
  }

  return building;
}

export async function deleteBuilding(id: string) {
  const building = await Building.findByIdAndDelete(id);
  if (!building) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Building not found');
  }

  await Floor.deleteMany({ building: id });

  await Factory.findByIdAndUpdate(building.factory, {
    $inc: { totalBuildings: -1 },
  });

  return building;
}

export async function createFloor(data: Record<string, unknown>) {
  return Floor.create(data);
}

export async function getFloors(query: PaginationQuery, buildingId?: string) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (buildingId) filter.building = buildingId;

  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'number';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [floors, total] = await Promise.all([
    Floor.find(filter)
      .populate('building', 'name code')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Floor.countDocuments(filter),
  ]);

  return {
    floors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateFloor(id: string, data: Record<string, unknown>) {
  const floor = await Floor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!floor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Floor not found');
  }

  return floor;
}

export async function createZone(data: Record<string, unknown>) {
  return Zone.create(data);
}

export async function getZones(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];

  const zoneFilterKeys = ['type', 'floor', 'building', 'factory'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      if (zoneFilterKeys.includes(key)) {
        filter[key] = query[key];
      } else if (query[key] !== undefined) {
        filter[key] = query[key];
      }
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [zones, total] = await Promise.all([
    Zone.find(filter)
      .populate('floor', 'name number')
      .populate('building', 'name code')
      .populate('factory', 'name code')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Zone.countDocuments(filter),
  ]);

  return {
    zones,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getZoneById(id: string) {
  const zone = await Zone.findById(id)
    .populate('floor', 'name number')
    .populate('building', 'name code')
    .populate('factory', 'name code');

  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }

  return zone;
}

export async function updateZone(id: string, data: Record<string, unknown>) {
  const zone = await Zone.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }

  return zone;
}

export async function getRestrictedAreas(factoryId: string) {
  return Zone.find({ factory: factoryId, type: ZoneType.RESTRICTED })
    .populate('floor', 'name number')
    .populate('building', 'name code');
}

export async function getEvacuationRoutes(factoryId: string) {
  return Zone.find({ factory: factoryId, type: ZoneType.EVACUATION_ROUTE })
    .populate('floor', 'name number')
    .populate('building', 'name code');
}

export async function getSafeZones(factoryId: string) {
  return Zone.find({ factory: factoryId, type: ZoneType.SAFE_ZONE })
    .populate('floor', 'name number')
    .populate('building', 'name code');
}

export async function createDepartment(data: Record<string, unknown>) {
  return Department.create(data);
}

export async function getDepartments(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .populate('factory', 'name code')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(filter),
  ]);

  return {
    departments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateDepartment(id: string, data: Record<string, unknown>) {
  const department = await Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  return department;
}
