/**
 * @module routes/organ
 * @desc Provides routes for organ management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/organ';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', }, }), controller.search);
router.post('/', requireAuth, requireBody({ bio: { type: 'string', optional: true, }, }), controller.create);
router.get('/:oid', controller.parseOid, controller.get);

router.post('/:oid/biopic', requireAuth, controller.parseOid, controller.uploadBioPic);
router.get('/:oid/biopic/:uuid', controller.parseOid, controller.getBioPic);

router.get('/:oid/pic', controller.parseOid, controller.getPic);
router.put('/:oid/pic', requireAuth, controller.parseOid, controller.setPic);
router.delete('/:oid/pic', requireAuth, controller.parseOid, controller.removePic);

router.get('/:oid/socials', controller.parseOid, controller.getSocials);
router.post('/:oid/socials', requireAuth, requireBody({ platform: { type: 'number', }, url: { type: 'string', }, }), controller.parseOid, controller.addSocials);
router.patch('/:oid/socials/:sid', requireAuth, requireBody({ url: { type: 'string', }, }), controller.parseOid, controller.updateSocials);
router.delete('/:oid/socials/:sid', requireAuth, controller.parseOid, controller.removeSocials);

router.get('/:oid/sources', controller.parseOid, controller.getSources);
router.post('/:oid/sources', requireAuth, requireBody({ url: { type: 'string', }, }), controller.parseOid, controller.addSource);
router.patch('/:oid/sources/:sid', requireAuth, requireBody({ url: { type: 'string', } }), controller.parseOid, controller.updateSource);
router.delete('/:oid/sources/:sid', requireAuth, controller.parseOid, controller.removeSource);

router.get('/:oid/memberships', controller.parseOid, controller.getMemberships);
router.post('/:oid/memberships', 
  requireAuth,
  requireBody({
    sources: { type: 'array', items: 'string', },
    organization: { type: 'number', },
    role: { type: 'number', },
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }),
  controller.parseOid,
  controller.addMembership
);
router.patch('/:oid/memberships/:mid',
  requireAuth,
  requireBody({
    role: { type: 'number', optional: true, },
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }),
  controller.parseOid,
  controller.updateMembership
);
router.delete('/:oid/memberships/:mid', 
  requireAuth,
  controller.parseOid, controller.removeMembership
);

router.get('/:oid/memberships/:mid/sources', controller.parseOid, controller.getMembershipSources);

export default router;
