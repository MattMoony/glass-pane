import { Router } from 'express';
import * as controller from '../controllers/organ';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:organId/sources', controller.checkOid, controller.getSources);
router.patch('/:organId/sources/:sourceId', controller.checkOid, controller.updateSource);
router.post('/:organId/sources', controller.checkOid, controller.addSource);
router.delete('/:organId/sources/:sourceId', controller.checkOid, controller.removeSource);

export default router;
