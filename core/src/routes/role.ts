/**
 * @module routes/role
 * @desc Provides routes for role management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/role';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.post('/', requireAuth, requireBody({ name: { type: 'string', }, }), controller.create);
router.get('/:rid', controller.parseRid, controller.get);
router.patch('/:rid', requireAuth, requireBody({ name: { type: 'string', }, }), controller.parseRid, controller.update);
router.delete('/:rid', requireAuth, controller.parseRid, controller.remove);

export default router;
