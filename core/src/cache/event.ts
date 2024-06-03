/**
 * Cache for events in order not to overload the DB.
 */

import { LRUCache } from 'lru-cache';
import Event from '../models/Event';

const EVENT_CACHE = new LRUCache<number, Event>({
  max: 1000,
});

export default EVENT_CACHE;
