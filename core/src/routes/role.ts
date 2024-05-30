/**
 * @module routes/role
 * @desc Provides routes for role management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/role';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { rid2role } from '../middleware/role';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.post('/', requireAuth, requireBody({ name: { type: 'string', }, }), controller.create);
router.get('/:rid', rid2role, controller.get);
router.patch('/:rid', requireAuth, requireBody({ name: { type: 'string', }, }), rid2role, controller.update);
router.delete('/:rid', requireAuth, rid2role, controller.remove);

export default router;
