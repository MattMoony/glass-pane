import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:userId', controller.parseUid, controller.get);
router.get('/:userId/name', controller.parseUid, controller.getName);
router.get('/:userId/pic', controller.parseUid, controller.getPic);
router.post('/:userId/pic', controller.parseUid, controller.setPic);
router.delete('/:userId/pic', controller.parseUid, controller.removePic);
router.patch('/:userId', controller.parseUid, controller.update);
router.delete('/:userId', controller.parseUid, controller.remove);
router.post('/:userId/relation', controller.parseUid, controller.addRelation);
router.patch('/:userId/relation', controller.parseUid, controller.updateRelation);
router.delete('/:userId/relation', controller.parseUid, controller.removeRelation);
router.get('/:userId/relation/sources', controller.parseUid, controller.getRelationSources);
router.post('/:userId/relation/sources', controller.parseUid, controller.addRelationSource);
router.patch('/:userId/relation/sources/:sourceId', controller.parseUid, controller.updateRelationSource);
router.delete('/:userId/relation/sources/:sourceId', controller.parseUid, controller.removeRelationSource);
router.get('/:userId/parents', controller.parseUid, controller.getParents);
router.get('/:userId/children', controller.parseUid, controller.getChildren);
router.get('/:userId/romantic', controller.parseUid, controller.getRomantic);
router.get('/:userId/friends', controller.parseUid, controller.getFriends);

export default router;
