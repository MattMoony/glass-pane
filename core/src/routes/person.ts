import { Router } from 'express';
import * as controller from '../controllers/person';

const router: Router = Router();

router.post('/new', controller.create);
router.get('/:userId', controller.get);

export default router;
