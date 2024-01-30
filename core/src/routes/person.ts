import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:userId', controller.get);
router.patch('/:userId', controller.update);
router.delete('/:userId', controller.remove)

export default router;
