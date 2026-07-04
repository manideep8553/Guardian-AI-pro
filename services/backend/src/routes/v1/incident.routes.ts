import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createIncidentSchema, updateIncidentSchema } from '../../validators/incident.validator';
import * as incidentController from '../../controllers/incident.controller';
import { UserRole } from '../../types';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(validate(createIncidentSchema), incidentController.createIncident)
  .get(incidentController.getIncidents);

router
  .route('/:id')
  .get(incidentController.getIncident)
  .patch(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SAFETY_OFFICER),
    validate(updateIncidentSchema),
    incidentController.updateIncident,
  )
  .delete(
    authorize(UserRole.ADMIN, UserRole.SUPERVISOR),
    incidentController.deleteIncident,
  );

export default router;
