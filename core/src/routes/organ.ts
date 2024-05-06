import { Router } from 'express';
import * as controller from '../controllers/organ';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:organId', controller.parseOid, controller.get);
router.get('/:organId/sources', controller.parseOid, controller.getSources);
router.post('/:organId/sources', controller.parseOid, controller.addSource);
router.patch('/:organId/sources/:sourceId', controller.parseOid, controller.updateSource);
router.delete('/:organId/sources/:sourceId', controller.parseOid, controller.removeSource);

export default router;
