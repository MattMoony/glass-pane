import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:userId', controller.get);
router.patch('/:userId', controller.update);
router.delete('/:userId', controller.remove);
router.post('/:userId/relation', controller.addRelation);
router.get('/:userId/parents', controller.getParents);
router.get('/:userId/romantic', controller.getRomantic);
router.get('/:userId/friends', controller.getFriends);

export default router;
