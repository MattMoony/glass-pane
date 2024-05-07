/**
 * @module routes/organ
 * @desc Provides routes for organ management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/organ';
import { requireBody } from '../middleware';

const router: Router = Router();

router.post('/', requireBody({ bio: { type: 'string', optional: true, }, }), controller.create);
router.get('/:oid', controller.parseOid, controller.get);

/*
router.get('/:oid/pic', controller.parseOid, controller.getPic);
router.post('/:oid/pic', controller.parseOid, controller.setPic);
router.delete('/:oid/pic', controller.parseOid, controller.removePic);
*/

router.get('/:oid/sources', controller.parseOid, controller.getSources);
router.post('/:oid/sources', requireBody({ url: { type: 'string', }, }), controller.parseOid, controller.addSource);
router.patch('/:oid/sources/:sid', requireBody({ url: { type: 'string', } }), controller.parseOid, controller.updateSource);
router.delete('/:oid/sources/:sid', controller.parseOid, controller.removeSource);

export default router;
