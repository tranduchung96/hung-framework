const debug = hung.createDebug('hung:cache:object');

/**
 * Cache adapter
 * @type {Abstractcache}
 */
let adapter = null,
    cacheprefix,
    keysperate = ':';

const lifetime = 0;
const defaultgroup = '__df__';  //Default group

/**
 * Setup cache adapter
 */
async function getCacheAdapter(){
    if(adapter !== null){
        return adapter;
    }
    
    let cachesettings = hung.settings.app.cache || {};
    
    //Cache prefix
    cacheprefix = cachesettings.prefix || null;
    
    if(cachesettings.adapter === 'memcached'){
        debug('Load memcached adapter');
        adapter = new (await import('./adapter/memcache.js')).default;
        return adapter;
    }
    
    if(cachesettings.adapter === 'redis'){
        debug('Load redis adapter');
        adapter = new (await import('./adapter/redis.js')).default;
        return adapter;
    }
    
    //no cache
    adapter = false;
    return adapter;
}

/**
 * Define memcached
 */
class ObjectCache{
    
    /**
     * Cache adapter
     * @type {Abstractcache}
     */
    adapter = null;
    
    isinit = false;
    
    /**
     * hung memcached
     */
    constructor(group){
        this.group = group || defaultgroup;
    }
    
    /**
     * Init memcached
     */
    async init(){
        if(this.isinit){
            return this;
        }
        
        debug('Init cache for group: ' + hung.trim(this.group, '__'));
        this.isinit = true;
        this.adapter = await getCacheAdapter();
    }
    
    /**
     * Connect to cache
     * @return {Promise<void>}
     */
    async connect(){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        return await this.adapter.connect();
    }
    
    /**
     * get cache data
     * @param key
     * @param def
     * @param group
     * @return {Promise<void>}
     */
    async get(key, def = null, group){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        let results = await this.adapter.get(this._key(key, group));
        if(results){
            return JSON.parse(results);
        }
        
        return def;
    }
    
    /**
     * Update memcache
     * @param key
     * @param value
     * @param group
     * @param timeout
     * @return {Promise<*>}
     */
    async set(key, value, group, timeout = 0){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        return this.adapter.set(this._key(key, group), JSON.stringify(value), timeout);
    }
    
    /**
     * Update memcache
     * @param key
     * @param value
     * @param group
     * @param timeout
     * @return {Promise<*>}
     */
    async delete(key, value, group = ''){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        await this.adapter.delete(this._key(key, group));
        return this;
    }
    
    /**
     * Flush cache
     */
    async flush(){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        await this.adapter.clear();
    }
    
    /**
     * Close cache
     */
    async close(){
        if(!this.isinit){
            await this.init();
        }
        
        if(!this.adapter){
            return undefined;
        }
        
        return await hung.promise((_ret) => {
            this.adapter.close((err) => {
                _ret(true);
            });
        });
    }
    
    /**
     * Create a key
     * @param key
     * @param group
     * @return {string}
     */
    _key(key, group){
        return cacheprefix + keysperate + key + keysperate + (group || this.group);
    }
}

/**
 * Create object cache
 * @param group
 * @return {ObjectCache}
 */
export function createObjectCache(group){
    if(!group){
        group = defaultgroup;
    }else{
        group = group.toString();
        debug('Create cache group: ' + group);
        
        if(!group.startsWith('__') && !group.endsWith('__')){
            group = '__' + group + '__';
        }
    }
    
    return new ObjectCache(group);
}

export default ObjectCache;