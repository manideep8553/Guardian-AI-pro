import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createWorkerSchema,
  updateWorkerSchema,
  assignDeviceSchema,
  createShiftSchema,
  markAttendanceSchema,
  createCertificationSchema,
} from '../../validators/worker.validator';
import * as workerController from '../../controllers/worker.controller';
import { UserRole } from '../../types';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createWorkerSchema),
    workerController.createWorker,
  )
  .get(workerController.getWorkers);

router
  .route('/:id')
  .get(workerController.getWorker)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(updateWorkerSchema),
    workerController.updateWorker,
  );

router
  .route('/:id/devices')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(assignDeviceSchema),
    workerController.assignDevice,
  );

router
  .route('/:id/devices/:deviceId')
  .delete(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    workerController.removeDevice,
  );

router
  .route('/:id/qr')
  .get(workerController.generateQRCode);

router
  .route('/:id/certifications')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createCertificationSchema),
    workerController.createCertification,
  )
  .get(workerController.getCertifications);

router
  .route('/certifications/:id')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    workerController.updateCertification,
  );

router
  .route('/shifts')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createShiftSchema),
    workerController.createShift,
  )
  .get(workerController.getShifts);

router
  .route('/shifts/:id')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    workerController.updateShift,
  );

router
  .route('/attendance')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SAFETY_OFFICER),
    validate(markAttendanceSchema),
    workerController.markAttendance,
  )
  .get(workerController.getAttendance);

export default router;
