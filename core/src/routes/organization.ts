import { Router } from 'express';

import * as controller from '../controllers/organization';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { oid2organization } from '../middleware/organization';

const router: Router = Router();

// ORGANIZATION OPERATIONS
router.get('/', requireQuery(controller.QUERIES.SEARCH), controller.search);
router.get('/random', controller.random);
router.post('/', requireAuth, requireBody(controller.BODIES.CREATE), controller.create);
router.get('/:oid', oid2organization, controller.get);
router.patch('/:oid', requireAuth, oid2organization, requireBody(controller.BODIES.UPDATE), controller.update);
router.delete('/:oid', requireAuth, oid2organization, controller.remove);

// ORGANIZATION MEMBER OPERATIONS
router.get('/:oid/members', oid2organization, controller.members.get);

export default router;
