import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import * as analyticsController from '../../controllers/analytics.controller';

const router = Router();

router.get('/dashboard', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), analyticsController.getDashboardAnalytics);
router.get('/incident-trends', authenticate, analyticsController.getIncidentTrendsHandler);
router.get('/high-risk-zones', authenticate, analyticsController.getHighRiskZonesHandler);
router.get('/worker-safety', authenticate, analyticsController.getWorkerSafetyScoresHandler);
router.get('/compliance', authenticate, analyticsController.getComplianceDataHandler);
router.get('/ai-accuracy', authenticate, analyticsController.getAiAccuracyHandler);
router.get('/equipment-health', authenticate, analyticsController.getEquipmentHealthHandler);
router.get('/productivity', authenticate, analyticsController.getProductivityHandler);
router.get('/reports', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), analyticsController.getReport);

export default router;
