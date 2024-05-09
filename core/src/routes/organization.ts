import { Router } from 'express';
import * as controller from '../controllers/organization';
import { requireQuery } from '../middleware';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.post('/', controller.create);
router.get('/:oid', controller.parseOid, controller.get);
router.patch('/:oid', controller.parseOid, controller.update);
router.delete('/:oid', controller.parseOid, controller.remove);

router.get('/:oid/members', controller.parseOid, controller.getMembers);

export default router;
