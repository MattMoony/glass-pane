/**
 * @module routes/organ
 * @desc Provides routes for organ management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/organ';
import { requireBody, requireQuery } from '../middleware';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', }, }), controller.search);
router.post('/', requireBody({ bio: { type: 'string', optional: true, }, }), controller.create);
router.get('/:oid', controller.parseOid, controller.get);

router.get('/:oid/pic', controller.parseOid, controller.getPic);
router.put('/:oid/pic', controller.parseOid, controller.setPic);
router.delete('/:oid/pic', controller.parseOid, controller.removePic);

router.get('/:oid/sources', controller.parseOid, controller.getSources);
router.post('/:oid/sources', requireBody({ url: { type: 'string', }, }), controller.parseOid, controller.addSource);
router.patch('/:oid/sources/:sid', requireBody({ url: { type: 'string', } }), controller.parseOid, controller.updateSource);
router.delete('/:oid/sources/:sid', controller.parseOid, controller.removeSource);

router.get('/:oid/memberships', controller.parseOid, controller.getMemberships);
router.post('/:oid/memberships', 
  requireBody({
    sources: { type: 'array', items: 'string', },
    organization: { type: 'number', },
    role: { type: 'number', },
    since: { type: 'string', },
    until: { type: 'string', optional: true, },
  }),
  controller.parseOid,
  controller.addMembership
);
router.patch('/:oid/memberships',
  requireBody({
    organization: { type: 'number', },
    role: { type: 'number', },
    since: { type: 'string', },
    until: { type: 'string', optional: true, },
  }),
  controller.parseOid,
  controller.updateMembership
);
router.delete('/:oid/memberships', requireBody({
  organization: { type: 'number', },
  role: { type: 'number', },
  since: { type: 'string', },
}), controller.parseOid, controller.removeMembership);

export default router;
