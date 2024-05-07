/**
 * @module routes/role
 * @desc Provides routes for role management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/role';
import { requireBody, requireQuery } from '../middleware';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', } }), controller.search);
router.post('/', requireBody({ name: { type: 'string', }, }), controller.create);
router.get('/:rid', controller.parseRid, controller.get);
router.patch('/:rid', requireBody({ name: { type: 'string', }, }), controller.parseRid, controller.update);
router.delete('/:rid', controller.parseRid, controller.remove);

export default router;
