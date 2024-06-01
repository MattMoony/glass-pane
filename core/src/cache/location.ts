/**
 * Cache for locations in order not to overload the DB.
 */

import { LRUCache } from 'lru-cache';
import type Location from '../models/Location';

const LOCATION_CACHE = new LRUCache<number, Location>({
  max: 1000,
});

export default LOCATION_CACHE;
