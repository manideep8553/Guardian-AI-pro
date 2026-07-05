import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import * as monitorController from '../../controllers/monitor.controller';

const router = Router();

router.get('/dashboard', authenticate, monitorController.getDashboardSummary);
router.get('/workers', authenticate, monitorController.getWorkerStatuses);
router.get('/alerts', authenticate, monitorController.getAlerts);
router.get('/emergencies', authenticate, monitorController.listEmergencies);
router.get('/fusion-history', authenticate, monitorController.getFusionHistory);

router.post('/ingest', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), monitorController.ingestSensorData);
router.post('/fuse', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), monitorController.ingestMultimodal);
router.post('/emergencies', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), monitorController.triggerEmergency);
router.patch('/emergencies/:id/acknowledge', authenticate, monitorController.acknowledgeEmergencyEvent);
router.patch('/emergencies/:id/resolve', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), monitorController.resolveEmergencyEvent);

export default router;
