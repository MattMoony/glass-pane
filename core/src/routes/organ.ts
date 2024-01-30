import { Router } from 'express';
import * as controller from '../controllers/organ';

const router: Router = Router();

router.post('/new', controller.create);

export default router;
