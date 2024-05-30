import { Router } from 'express';
import * as controller from '../controllers/auth';
import { requireAuth } from '../middleware/auth';
import { requireBody } from '../middleware';

const router: Router = Router();

router.get('/status', requireAuth, controller.status);
router.post('/login', requireBody(controller.BODIES.LOGIN), controller.login);

export default router;
