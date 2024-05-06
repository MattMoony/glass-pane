import { Router } from 'express';
import * as controller from '../controllers/organ';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:organId', controller.checkOid, controller.get);
router.get('/:organId/sources', controller.checkOid, controller.getSources);
router.post('/:organId/sources', controller.checkOid, controller.addSource);
router.patch('/:organId/sources/:sourceId', controller.checkOid, controller.updateSource);
router.delete('/:organId/sources/:sourceId', controller.checkOid, controller.removeSource);

export default router;
