import { Router } from 'express';

import * as controller from '../controllers/nation';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { nid2nation } from '../middleware/nation';

const router: Router = Router();

// NATION OPERATIONS
router.get('/', requireQuery(controller.QUERIES.SEARCH), controller.search);
router.post('/', requireAuth, requireBody(controller.BODIES.CREATE), controller.create);
router.get('/:nid', nid2nation, controller.get);
router.patch('/:nid', requireAuth, nid2nation, requireBody(controller.BODIES.UPDATE), controller.update);
router.delete('/:nid', requireAuth, nid2nation, controller.remove);

export default router;
