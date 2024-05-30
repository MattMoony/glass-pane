/**
 * @module routes/organ
 * @desc Provides routes for organ management.
 * @requires express
 */

import { Router } from 'express';
import * as controller from '../controllers/organ';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { oid2organ } from '../middleware/organ';

const router: Router = Router();

router.get('/', requireQuery({ q: { type: 'string', }, }), controller.search);
router.post('/', requireAuth, requireBody({ bio: { type: 'string', optional: true, }, }), controller.create);
router.get('/:oid', oid2organ, controller.get);

// the following two endpoints are deprecated,
// use the media endpoint instead - only kept here
// for now as to not break the frontend
router.post('/:oid/biopic', requireAuth, oid2organ, controller.biopic.upload);
router.get('/:oid/biopic/:uuid', oid2organ, controller.biopic.get);

router.get('/:oid/pic', oid2organ, controller.pic.get);
router.put('/:oid/pic', requireAuth, oid2organ, controller.pic.set);
router.delete('/:oid/pic', requireAuth, oid2organ, controller.pic.remove);

router.get('/:oid/socials', oid2organ, controller.socials.get);
router.post('/:oid/socials', requireAuth, requireBody({ platform: { type: 'number', }, url: { type: 'string', }, }), oid2organ, controller.socials.add);
router.patch('/:oid/socials/:sid', requireAuth, requireBody({ url: { type: 'string', }, }), oid2organ, controller.socials.update);
router.delete('/:oid/socials/:sid', requireAuth, oid2organ, controller.socials.remove);

router.get('/:oid/sources', oid2organ, controller.sources.get);
router.post('/:oid/sources', requireAuth, requireBody({ url: { type: 'string', }, }), oid2organ, controller.sources.add);
router.patch('/:oid/sources/:sid', requireAuth, requireBody({ url: { type: 'string', } }), oid2organ, controller.sources.update);
router.delete('/:oid/sources/:sid', requireAuth, oid2organ, controller.sources.remove);

router.get('/:oid/memberships', oid2organ, controller.memberships.get);
router.post('/:oid/memberships', 
  requireAuth,
  requireBody({
    sources: { type: 'array', items: 'string', },
    organization: { type: 'number', },
    role: { type: 'number', },
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }),
  oid2organ,
  controller.memberships.add
);
router.patch('/:oid/memberships/:mid',
  requireAuth,
  requireBody({
    role: { type: 'number', optional: true, },
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }),
  oid2organ,
  controller.memberships.update
);
router.delete('/:oid/memberships/:mid', 
  requireAuth,
  oid2organ, 
  controller.memberships.remove
);

router.get('/:oid/memberships/:mid/sources', oid2organ, controller.memberships.sources.get);

export default router;
