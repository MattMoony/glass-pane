import { Router } from 'express';

import * as controller from '../controllers/person';
import { requireBody, requireQuery } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { pid2person } from '../middleware/person';

const router: Router = Router();

// PERSON OPERATIONS
router.get('/', requireQuery(controller.QUERIES.SEARCH), controller.search);
router.post('/', requireAuth, requireBody(controller.BODIES.CREATE), controller.create);
router.get('/random', controller.random);
router.get('/:pid', pid2person, controller.get);
router.patch('/:pid', requireAuth, pid2person, requireBody(controller.BODIES.UPDATE), pid2person, controller.update);
router.delete('/:pid', requireAuth, pid2person, controller.remove);

// PERSON RELATION OPERATIONS
router.get('/:pid/relation', pid2person, controller.relations.get);
router.post('/:pid/relation', requireAuth, requireBody(controller.relations.BODIES.ADD), pid2person, controller.relations.add);
router.patch('/:pid/relation/:rid', requireAuth, requireBody(controller.relations.BODIES.UPDATE), pid2person, controller.relations.update);
router.delete('/:pid/relation/:rid', requireAuth, pid2person, controller.relations.remove);
router.get('/:pid/parents', pid2person, controller.relations.parents);
router.get('/:pid/children', pid2person, controller.relations.children);
router.get('/:pid/romantic', pid2person, controller.relations.romantic);
router.get('/:pid/friends', pid2person, controller.relations.friends);

// PERSON RELATION SOURCES OPERATIONS
router.get('/:pid/relation/:rid/sources', pid2person, controller.relations.sources.get);
router.post('/:pid/relation/sources', requireAuth, requireBody(controller.relations.sources.BODIES.ADD), pid2person, controller.relations.sources.add);
router.patch('/:pid/relation/sources/:sid', requireAuth, requireBody(controller.relations.sources.BODIES.UPDATE), pid2person, controller.relations.sources.update);
router.delete('/:pid/relation/sources/:sid', requireAuth, pid2person, controller.relations.sources.remove);

export default router;
