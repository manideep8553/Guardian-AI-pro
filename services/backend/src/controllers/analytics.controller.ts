import httpStatus from 'http-status';
import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import type { IAuthRequest } from '../types';
import {
  getIncidentTrends,
  getHighRiskZones,
  getWorkerSafetyScores,
  getComplianceData,
  getAiAccuracyMetrics,
  getEquipmentHealth,
  getProductivityMetrics,
  getComplianceReport,
  getIncidentReport,
  getAuditReport,
  getWorkerPerformanceReport,
  getSafetyAnalyticsReport,
} from '../services/analytics.service';

export const getDashboardAnalytics = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const [incidentTrends, highRiskZones, safetyScores, complianceData, aiAccuracy, equipmentHealth, productivity] =
    await Promise.all([
      getIncidentTrends(30),
      getHighRiskZones(),
      getWorkerSafetyScores(),
      getComplianceData(),
      getAiAccuracyMetrics(),
      getEquipmentHealth(),
      getProductivityMetrics('week'),
    ]);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      incidentTrends,
      highRiskZones,
      safetyScores: safetyScores.slice(0, 10),
      complianceData,
      aiAccuracy: aiAccuracy.slice(-7),
      equipmentHealth,
      productivity,
    },
  });
});

export const getIncidentTrendsHandler = catchAsync(async (req: IAuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const factoryId = req.query.factoryId as string | undefined;
  const data = await getIncidentTrends(days, factoryId);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getHighRiskZonesHandler = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const data = await getHighRiskZones();

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getWorkerSafetyScoresHandler = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const data = await getWorkerSafetyScores();

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getComplianceDataHandler = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const data = await getComplianceData();

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getAiAccuracyHandler = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const data = await getAiAccuracyMetrics();

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getEquipmentHealthHandler = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const data = await getEquipmentHealth();

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getProductivityHandler = catchAsync(async (req: IAuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'week';
  const data = await getProductivityMetrics(period);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getReport = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { type, format, startDate, endDate } = req.query;

  if (!type || !startDate || !endDate) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'type, startDate, and endDate query parameters are required',
    });
    return;
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Invalid date format',
    });
    return;
  }

  let data: unknown;

  switch (type) {
    case 'compliance':
      data = await getComplianceReport(start, end);
      break;
    case 'incident':
      data = await getIncidentReport(start, end);
      break;
    case 'audit':
      data = await getAuditReport(start, end);
      break;
    case 'worker-performance':
      data = await getWorkerPerformanceReport(start, end);
      break;
    case 'safety-analytics':
      data = await getSafetyAnalyticsReport(start, end);
      break;
    default:
      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid report type. Must be one of: compliance, incident, audit, worker-performance, safety-analytics',
      });
      return;
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: `${type} report generated`,
    data: {
      type,
      format: format || 'json',
      period: { startDate: start, endDate: end },
      generatedAt: new Date(),
      report: data,
    },
  });
});
