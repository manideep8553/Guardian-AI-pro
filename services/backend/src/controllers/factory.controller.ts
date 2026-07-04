import { Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import { pick } from '../utils/pick';
import * as factoryService from '../services/factory.service';
import { IAuthRequest } from '../types';

export const createFactory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const factoryData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const factory = await factoryService.createFactory(factoryData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Factory created successfully',
    data: factory,
  });
});

export const getFactories = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await factoryService.getFactories({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Factories retrieved successfully',
    ...result,
  });
});

export const getFactory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const factory = await factoryService.getFactoryById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Factory retrieved successfully',
    data: factory,
  });
});

export const updateFactory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const factory = await factoryService.updateFactory(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Factory updated successfully',
    data: factory,
  });
});

export const deleteFactory = catchAsync(async (req: IAuthRequest, res: Response) => {
  await factoryService.deleteFactory(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Factory deleted successfully',
  });
});

export const createBuilding = catchAsync(async (req: IAuthRequest, res: Response) => {
  const buildingData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const building = await factoryService.createBuilding(buildingData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Building created successfully',
    data: building,
  });
});

export const getBuildings = catchAsync(async (req: IAuthRequest, res: Response) => {
  const factoryId = req.query.factory as string | undefined;
  const filter = pick(req.query, ['isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await factoryService.getBuildings({ ...filter, ...options }, factoryId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Buildings retrieved successfully',
    ...result,
  });
});

export const getBuilding = catchAsync(async (req: IAuthRequest, res: Response) => {
  const building = await factoryService.getBuildingById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Building retrieved successfully',
    data: building,
  });
});

export const updateBuilding = catchAsync(async (req: IAuthRequest, res: Response) => {
  const building = await factoryService.updateBuilding(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Building updated successfully',
    data: building,
  });
});

export const deleteBuilding = catchAsync(async (req: IAuthRequest, res: Response) => {
  await factoryService.deleteBuilding(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Building deleted successfully',
  });
});

export const createFloor = catchAsync(async (req: IAuthRequest, res: Response) => {
  const floorData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const floor = await factoryService.createFloor(floorData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Floor created successfully',
    data: floor,
  });
});

export const getFloors = catchAsync(async (req: IAuthRequest, res: Response) => {
  const buildingId = req.query.building as string | undefined;
  const filter = pick(req.query, ['isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await factoryService.getFloors({ ...filter, ...options }, buildingId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Floors retrieved successfully',
    ...result,
  });
});

export const updateFloor = catchAsync(async (req: IAuthRequest, res: Response) => {
  const floor = await factoryService.updateFloor(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Floor updated successfully',
    data: floor,
  });
});

export const createZone = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zoneData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const zone = await factoryService.createZone(zoneData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Zone created successfully',
    data: zone,
  });
});

export const getZones = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['type', 'floor', 'building', 'factory', 'isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await factoryService.getZones({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Zones retrieved successfully',
    ...result,
  });
});

export const getZone = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zone = await factoryService.getZoneById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Zone retrieved successfully',
    data: zone,
  });
});

export const updateZone = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zone = await factoryService.updateZone(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Zone updated successfully',
    data: zone,
  });
});

export const getRestrictedAreas = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zones = await factoryService.getRestrictedAreas(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Restricted areas retrieved successfully',
    data: zones,
  });
});

export const getEvacuationRoutes = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zones = await factoryService.getEvacuationRoutes(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Evacuation routes retrieved successfully',
    data: zones,
  });
});

export const getSafeZones = catchAsync(async (req: IAuthRequest, res: Response) => {
  const zones = await factoryService.getSafeZones(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Safe zones retrieved successfully',
    data: zones,
  });
});

export const createDepartment = catchAsync(async (req: IAuthRequest, res: Response) => {
  const departmentData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const department = await factoryService.createDepartment(departmentData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

export const getDepartments = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['factory', 'isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await factoryService.getDepartments({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Departments retrieved successfully',
    ...result,
  });
});

export const updateDepartment = catchAsync(async (req: IAuthRequest, res: Response) => {
  const department = await factoryService.updateDepartment(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Department updated successfully',
    data: department,
  });
});
