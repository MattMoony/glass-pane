import { Router } from 'express';

import * as controller from '../controllers/location';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { lid2location } from '../middleware/location';

const router: Router = Router();

// LOCATION OPERATIONS
router.get('/', requireQuery(controller.QUERIES.SEARCH), controller.search);
router.post('/', requireAuth, requireBody(controller.BODIES.CREATE), controller.create);
router.get('/:lid', lid2location, controller.get);
router.patch('/:lid', requireAuth, lid2location, requireBody(controller.BODIES.UPDATE), controller.update);
router.delete('/:lid', requireAuth, lid2location, controller.remove);

export default router;
