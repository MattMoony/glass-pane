import { Router } from 'express';
import * as controller from '../controllers/organization';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:orgId', controller.parseOid, controller.get);
router.patch('/:orgId', controller.parseOid, controller.update);
router.delete('/:orgId', controller.parseOid, controller.remove);

export default router;
