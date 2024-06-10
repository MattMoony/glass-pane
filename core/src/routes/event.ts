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
router.get('/:eid/participants', eid2event, controller.participants);

// EVENT SOURCE OPERATIONS
router.get('/:eid/source', eid2event, controller.sources.get);
router.post('/:eid/source', requireAuth, eid2event, requireBody(controller.sources.BODIES.CREATE), controller.sources.add);
router.patch('/:eid/source/:sid', requireAuth, eid2event, requireBody(controller.sources.BODIES.UPDATE), controller.sources.update);
router.delete('/:eid/source/:sid', requireAuth, eid2event, controller.sources.remove);

export default router;
