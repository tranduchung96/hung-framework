import {key} from "kue/lib/queue/events.js";
import {createClient} from 'redis';
import Abstractcache from './abstractcache.js';

const debug = hung.createDebug('hung:cache:redis');

const defaultconfig = {
    host: '127.0.0.1',
    port: 6379,
    username: null,
    password: null,
    db: 0
}

/**
 * Redis cache adapter
 */
class RedisCache extends Abstractcache{
    
    /**
     * Redis client
     * @type {RedisClient}
     */
    client = null;
    
    /**
     * Connect to redis.
     */
    async connect(){
        try{
            this.isReady = true;
            if(this.client !== null){
                return this.client;
            }
            
            let cachesettings = hung.settings.app.cache || {};
            hung.defaults(cachesettings, defaultconfig);
            
            let options = {
                url: `redis://${cachesettings.host}:${cachesettings.port}/${cachesettings.db}`,
                return_buffers: true
            };
            
            //Not empty username and password
            if(!hung.isEmpty(cachesettings.username, cachesettings.password)){
                options.username = cachesettings.username;
                options.password = cachesettings.password;
            }
            
            debug('Load redis adapter');
            let client = createClient(options);
            client.on('error', (error) => {
                debug('Redis error: ' + error);
                this.isReady = false;
                this.client = false;
            });
            
            this.client = client;
            await client.connect();
            return client;
        }catch(e){
            debug('Redis error: ' + e);
        }
        
        this.isReady = false;
        this.client = false;
        return client;
    }
    
    /**
     * Set a value in redis cache.
     * @param key
     * @param value
     * @param ttl
     */
    async set(key, value){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            await this.client.set(key, value);
            return this;
        }catch(e){
            hung.log_error(e);
        }
    }
    
    /**
     * Get a value from redis cache.
     * @param key
     */
    async get(key){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            return await this.client.get(key);
        }catch(e){
            hung.log_error(e);
        }
    }
    
    /**
     * Delete a value from redis cache.
     * @param key
     */
    async delete(key){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            await this.client.del(key);
            return this;
        }catch(e){
            hung.log_error(e);
        }
    }
    
    /**
     * Check if a key exists in redis cache.
     * @param key
     */
    async has(key){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            return await this.client.exists(key);
        }catch(e){
            hung.log_error(e);
        }
    }
    
    /**
     * Clear redis cache.
     */
    async clear(){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            await this.client.flushdb();
            return this;
        }catch(e){
            hung.log_error(e);
        }
    }
    
    async close(){
        try{
            if(!this.isReady){
                await this.connect();
            }
            
            if(!this.client){
                return undefined;
            }
            
            await this.client.quit();
            return this;
        }catch(e){
            hung.log_error(e);
        }
    }
    
}

export default RedisCache;