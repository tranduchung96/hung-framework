import ObjectCache, {createObjectCache} from './objectcache.js';

/**
 * Cache object
 * @type {ObjectCache}
 */
hung.cache = createObjectCache();

/**
 * Create cache object
 * @type {(function(*): ObjectCache)|*}
 */
hung.createCache = createObjectCache;

export default hung.cache;