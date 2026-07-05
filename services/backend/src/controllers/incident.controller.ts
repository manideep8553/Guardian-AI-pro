import { Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import { pick, parsePaginationQuery } from '../utils/pick';
import * as incidentService from '../services/incident.service';
import { IAuthRequest } from '../types';

export const createIncident = catchAsync(async (req: IAuthRequest, res: Response) => {
  const incidentData = {
    ...req.body,
    reportedBy: req.user!.userId,
  };
  const incident = await incidentService.createIncident(incidentData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Incident reported successfully',
    data: incident,
  });
});

export const getIncidents = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['status', 'severity', 'type']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await incidentService.getIncidents({ ...filter, ...parsePaginationQuery(options) } as Parameters<typeof incidentService.getIncidents>[0]);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Incidents retrieved successfully',
    ...result,
  });
});

export const getIncident = catchAsync(async (req: IAuthRequest, res: Response) => {
  const incident = await incidentService.getIncidentById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Incident retrieved successfully',
    data: incident,
  });
});

export const updateIncident = catchAsync(async (req: IAuthRequest, res: Response) => {
  const incident = await incidentService.updateIncident(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Incident updated successfully',
    data: incident,
  });
});

export const deleteIncident = catchAsync(async (req: IAuthRequest, res: Response) => {
  await incidentService.deleteIncident(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Incident deleted successfully',
  });
});
