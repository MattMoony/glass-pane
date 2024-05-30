import { Router } from 'express';

import * as controller from '../controllers/person';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { pid2person } from '../middleware/person';

const router: Router = Router();

router.post('/',
  requireAuth,
  requireBody({
    firstname: { type: 'string', },
    lastname: { type: 'string', },
    bio: { type: 'string', optional: true, },
    birthdate: { type: 'string', optional: true, },
    deathdate: { type: 'string', optional: true, },
  }), 
  controller.create
);
router.get('/', requireQuery({ q: { type: 'string', }, }), controller.search);
router.get('/random', controller.random);
router.get('/:pid', pid2person, controller.get);
router.patch('/:pid', 
  requireAuth,
  requireBody({
    firstname: { type: 'string', optional: true, },
    lastname: { type: 'string', optional: true, },
    bio: { type: 'string', optional: true, },
    birthdate: { type: 'string', optional: true, },
    deathdate: { type: 'string', optional: true, },
  }), 
  pid2person, 
  controller.update
);
router.delete('/:pid', requireAuth, pid2person, controller.remove);

router.post('/:pid/relation', 
  requireAuth,
  requireBody({
    type: { type: 'number', },
    other: { type: 'number', },
    sources: { type: 'array', items: 'string', },
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }), 
  pid2person, 
  controller.relations.add
);
router.patch('/:pid/relation/:rid', 
  requireAuth,
  requireBody({
    since: { type: 'string', optional: true, nullable: true, },
    until: { type: 'string', optional: true, nullable: true, },
  }),
  pid2person, 
  controller.relations.update
);
router.delete('/:pid/relation/:rid', requireAuth, pid2person, controller.relations.remove);
router.get('/:pid/parents', pid2person, controller.relations.parents);
router.get('/:pid/children', pid2person, controller.relations.children);
router.get('/:pid/romantic', pid2person, controller.relations.romantic);
router.get('/:pid/friends', pid2person, controller.relations.friends);

router.get('/:pid/relation/:rid/sources', 
  pid2person, 
  controller.relations.sources.get
);
router.post('/:pid/relation/sources', 
  requireAuth,
  requireBody({
    other: { type: 'number', },
    since: { type: 'string', },
    url: { type: 'string', },
  }), 
  pid2person, 
  controller.relations.sources.add
);
router.patch('/:pid/relation/sources/:sid', 
  requireAuth,
  requireBody({
    url: { type: 'string', },
  }), 
  pid2person, 
  controller.relations.sources.update
);
router.delete('/:pid/relation/sources/:sid', requireAuth, pid2person, controller.relations.sources.remove);

export default router;
