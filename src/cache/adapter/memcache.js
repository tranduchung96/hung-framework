import memcache from 'memcache';
import {key} from "kue/lib/queue/events.js";
import Abstractcache from './abstractcache.js';

/**
 * Memcache cache adapter
 */
class Memcache extends Abstractcache{
    
    /**
     * Connect to memcache.
     */
    async connect(){
    
    }
    
    /**
     * Set a value in memcache.
     * @param key
     * @param value
     * @param ttl
     */
    async set(key, value, ttl){
    
    }
    
    /**
     * Get a value from memcache.
     * @param key
     */
    async get(key){
    
    }
    
    /**
     * Delete a value from memcache.
     * @param key
     */
    async delete(key){
    
    }
    
    /**
     * Check if a key exists in memcache.
     * @param key
     */
    async has(key){
    
    }
    
    /**
     * Clear memcache.
     */
    async clear(){
    
    }
    
    /**
     * Close memcache connection.
     */
    async close(){
    
    }
    
}

export default Memcache;