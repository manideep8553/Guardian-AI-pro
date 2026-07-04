import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  registerDeviceSchema,
  updateDeviceSchema,
  firmwareUploadSchema,
  calibrationSchema,
} from '../../validators/device.validator';
import * as deviceController from '../../controllers/device.controller';
import { UserRole } from '../../types';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(registerDeviceSchema),
    deviceController.registerDevice,
  )
  .get(deviceController.getDevices);

router
  .route('/types/:type')
  .get(deviceController.getDevicesByType);

router
  .route('/worker/:workerId')
  .get(deviceController.getDevicesByWorker);

router
  .route('/:id')
  .get(deviceController.getDevice)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(updateDeviceSchema),
    deviceController.updateDevice,
  )
  .delete(authorize(UserRole.ADMIN), deviceController.deleteDevice);

router
  .route('/:id/status')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    deviceController.updateDeviceStatus,
  );

router
  .route('/:id/battery')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    deviceController.updateBatteryLevel,
  );

router
  .route('/:id/telemetry')
  .get(deviceController.getDeviceTelemetry);

router
  .route('/firmware')
  .post(
    authorize(UserRole.ADMIN),
    validate(firmwareUploadSchema),
    deviceController.uploadFirmware,
  )
  .get(deviceController.getFirmwares);

router
  .route('/firmware/:id')
  .get(deviceController.getFirmware);

router
  .route('/firmware/:id/deploy')
  .post(
    authorize(UserRole.ADMIN),
    deviceController.deployFirmware,
  );

router
  .route('/:id/calibrations')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(calibrationSchema),
    deviceController.performCalibration,
  )
  .get(deviceController.getCalibrationHistory);

export default router;
