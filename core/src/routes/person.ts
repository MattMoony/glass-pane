import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/relation/source', controller.getRelationSource);
router.get('/:userId', controller.checkUid, controller.get);
router.patch('/:userId', controller.checkUid, controller.update);
router.delete('/:userId', controller.checkUid, controller.remove);
router.post('/:userId/relation', controller.checkUid, controller.addRelation);
router.get('/:userId/parents', controller.checkUid, controller.getParents);
router.get('/:userId/children', controller.checkUid, controller.getChildren);
router.get('/:userId/romantic', controller.checkUid, controller.getRomantic);
router.get('/:userId/friends', controller.checkUid, controller.getFriends);

export default router;
