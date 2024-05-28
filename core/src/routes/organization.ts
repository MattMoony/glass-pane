import { Router } from 'express';
import * as controller from '../controllers/organization';
import { requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.get('/random', controller.getRandom);
router.post('/', requireAuth, controller.create);
router.get('/:oid', controller.parseOid, controller.get);
router.patch('/:oid', requireAuth, controller.parseOid, controller.update);
router.delete('/:oid', requireAuth, controller.parseOid, controller.remove);

router.get('/:oid/members', controller.parseOid, controller.getMembers);

export default router;
