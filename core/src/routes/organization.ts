import { Router } from 'express';

import * as controller from '../controllers/organization';
import { requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { oid2organization } from '../middleware/organization';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.get('/random', controller.random);
router.post('/', requireAuth, controller.create);
router.get('/:oid', oid2organization, controller.get);
router.patch('/:oid', requireAuth, oid2organization, controller.update);
router.delete('/:oid', requireAuth, oid2organization, controller.remove);

router.get('/:oid/members', oid2organization, controller.members.get);

export default router;
