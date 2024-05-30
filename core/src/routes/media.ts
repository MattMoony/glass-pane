/**
 * @module routes/media
 * @desc Provides routes for media management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/media';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();

router.post('/', requireAuth, controller.uploadPic);
router.get('/:uuid', controller.getPic);

export default router;
