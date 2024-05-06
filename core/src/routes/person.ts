import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:userId', controller.checkUid, controller.get);
router.get('/:userId/name', controller.checkUid, controller.getName);
router.get('/:userId/pic', controller.checkUid, controller.getPic);
router.post('/:userId/pic', controller.checkUid, controller.setPic);
router.delete('/:userId/pic', controller.checkUid, controller.removePic);
router.patch('/:userId', controller.checkUid, controller.update);
router.delete('/:userId', controller.checkUid, controller.remove);
router.get('/:userId/relation/sources', controller.checkUid, controller.getRelationSources);
router.post('/:userId/relation', controller.checkUid, controller.addRelation);
router.patch('/:userId/relation', controller.checkUid, controller.updateRelation);
router.delete('/:userId/relation', controller.checkUid, controller.removeRelation);
router.get('/:userId/parents', controller.checkUid, controller.getParents);
router.get('/:userId/children', controller.checkUid, controller.getChildren);
router.get('/:userId/romantic', controller.checkUid, controller.getRomantic);
router.get('/:userId/friends', controller.checkUid, controller.getFriends);

export default router;
