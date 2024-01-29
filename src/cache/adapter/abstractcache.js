class Abstractcache{
    
    /**
     * is ready
     * @type {boolean}
     */
    isReady = false;
    
    /**
     * connects to the cache
     */
    async connect(){
        throw new Error('Abstractcache::connect() must be implemented');
    }
    
    /**
     *
     * @param {String} key
     * @param {String} value
     * @param {Number} ttl
     */
    async set(key, value, ttl){
        throw new Error('Abstractcache::set() must be implemented');
    }
    
    /**
     * gets the value
     * @param {String} key
     */
    async get(key){
        throw new Error('Abstractcache::get() must be implemented');
    }
    
    /**
     * deletes the value
     * @param {String} key
     */
    async delete(key){
        throw new Error('Abstractcache::delete() must be implemented');
    }
    
    /**
     * checks if the key exists
     * @param {String} key
     */
    async has(key){
        throw new Error('Abstractcache::has() must be implemented');
    }
    
    /**
     * clears the cache
     */
    async clear(){
        throw new Error('Abstractcache::clear() must be implemented');
    }
    
    async close(){
        throw new Error('Abstractcache::close() must be implemented');
    }
    
}

export default Abstractcache;