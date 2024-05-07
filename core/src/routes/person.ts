import { Router } from 'express';
import * as controller from '../controllers/person';
import { requireBody, requireQuery } from '../middleware';

const router: Router = Router();

router.post('/', 
  requireBody({
    firstname: { type: 'string', },
    lastname: { type: 'string', },
    bio: { type: 'string', optional: true, },
    birthdate: { type: 'string', optional: true, },
    deathdate: { type: 'string', optional: true, },
  }), 
  controller.create
);
router.get('/:pid', 
  controller.parsePid, 
  controller.get
);
router.get('/:pid/name', 
  controller.parsePid, 
  controller.getName
);
router.patch('/:pid', 
  requireBody({
    firstname: { type: 'string', optional: true, },
    lastname: { type: 'string', optional: true, },
    bio: { type: 'string', optional: true, },
    birthdate: { type: 'string', optional: true, },
    deathdate: { type: 'string', optional: true, },
  }), 
  controller.parsePid, 
  controller.update
);
router.delete('/:pid', 
  controller.parsePid, 
  controller.remove
);

router.get('/:pid/pic', 
  controller.parsePid, 
  controller.getPic
);
router.post('/:pid/pic', 
  controller.parsePid, 
  controller.setPic
);
router.delete('/:pid/pic', 
  controller.parsePid, 
  controller.removePic
);

router.post('/:pid/relation', 
  requireBody({
    type: { type: 'number', },
    other: { type: 'number', },
    source: { type: 'string', },
    since: { type: 'string', },
    until: { type: 'string', optional: true, },
  }), 
  controller.parsePid, 
  controller.addRelation
);
router.patch('/:pid/relation', 
  requireBody({
    type: { type: 'number', },
    other: { type: 'number', },
    since: { type: 'string', },
    until: { type: 'string', optional: true, },
  }), 
  controller.parsePid, 
  controller.updateRelation
);
router.delete('/:pid/relation', 
  requireBody({
    type: { type: 'number', },
    other: { type: 'number', },
    since: { type: 'string', },
  }), 
  controller.parsePid, 
  controller.removeRelation
);
router.get('/:pid/parents', 
  controller.parsePid, 
  controller.getParents
);
router.get('/:pid/children', 
  controller.parsePid, 
  controller.getChildren
);
router.get('/:pid/romantic', 
  controller.parsePid, 
  controller.getRomantic
);
router.get('/:pid/friends', 
  controller.parsePid, 
  controller.getFriends
);

router.get('/:pid/relation/sources', 
  requireQuery({
    other: { type: 'string', },
    since: { type: 'string', },
  }), 
  controller.parsePid, 
  controller.getRelationSources
);
router.post('/:pid/relation/sources', 
  requireBody({
    other: { type: 'number', },
    since: { type: 'string', },
    url: { type: 'string', },
  }), 
  controller.parsePid, 
  controller.addRelationSource
);
router.patch('/:pid/relation/sources/:sid', 
  requireBody({
    url: { type: 'string', },
  }), 
  controller.parsePid, 
  controller.updateRelationSource
);
router.delete('/:pid/relation/sources/:sid', 
  controller.parsePid, 
  controller.removeRelationSource
);

export default router;
