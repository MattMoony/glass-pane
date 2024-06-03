/**
 * @module routes/event
 * @desc Provides routes for event management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/event';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { eid2event } from '../middleware/event';

const router: Router = Router();

// EVENT OPERATIONS
router.get('/', requireQuery(controller.QUERIES.SEARCH), controller.search);
router.post('/', requireAuth, requireBody(controller.BODIES.CREATE), controller.create);
router.get('/:eid', eid2event, controller.get);

export default router;
