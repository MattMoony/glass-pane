/**
 * Cache for organs (meaning people, organizations, etc.) 
 * in order not to overload the DB.
 */

import { LRUCache } from 'lru-cache';
import type Organ from '../models/Organ';

const ORGAN_CACHE = new LRUCache<number, Organ>({
  max: 1000,
});

export default ORGAN_CACHE;
