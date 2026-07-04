import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createFactorySchema,
  updateFactorySchema,
  createBuildingSchema,
  updateBuildingSchema,
  createFloorSchema,
  createZoneSchema,
  updateZoneSchema,
  createDepartmentSchema,
} from '../../validators/factory.validator';
import * as factoryController from '../../controllers/factory.controller';
import { UserRole } from '../../types';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createFactorySchema),
    factoryController.createFactory,
  )
  .get(factoryController.getFactories);

router
  .route('/:id')
  .get(factoryController.getFactory)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(updateFactorySchema),
    factoryController.updateFactory,
  )
  .delete(
    authorize(UserRole.ADMIN),
    factoryController.deleteFactory,
  );

router
  .route('/buildings')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createBuildingSchema),
    factoryController.createBuilding,
  )
  .get(factoryController.getBuildings);

router
  .route('/buildings/:id')
  .get(factoryController.getBuilding)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(updateBuildingSchema),
    factoryController.updateBuilding,
  )
  .delete(
    authorize(UserRole.ADMIN),
    factoryController.deleteBuilding,
  );

router
  .route('/floors')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createFloorSchema),
    factoryController.createFloor,
  )
  .get(factoryController.getFloors);

router
  .route('/floors/:id')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    factoryController.updateFloor,
  );

router
  .route('/zones')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createZoneSchema),
    factoryController.createZone,
  )
  .get(factoryController.getZones);

router
  .route('/zones/:id')
  .get(factoryController.getZone)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(updateZoneSchema),
    factoryController.updateZone,
  );

router
  .route('/:id/restricted-areas')
  .get(factoryController.getRestrictedAreas);

router
  .route('/:id/evacuation-routes')
  .get(factoryController.getEvacuationRoutes);

router
  .route('/:id/safe-zones')
  .get(factoryController.getSafeZones);

router
  .route('/departments')
  .post(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    validate(createDepartmentSchema),
    factoryController.createDepartment,
  )
  .get(factoryController.getDepartments);

router
  .route('/departments/:id')
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    factoryController.updateDepartment,
  );

export default router;
