import async, {nextTick} from 'async';
import parallel from 'async/parallel.js';
import lodash from 'lodash';
import {EventEmitter} from 'events';
import debug from 'debug';

const debuglog = debug('hung:eventobject');

class Eventobject{
    
    _events = {};
    
    /**
     * Flag to emited event
     * @type {{}}
     * @private
     */
    _didemits = {};
    
    /**
     * List of filter hooks
     * @type {{}}
     * @private
     */
    _filterhooks = {};
    
    /**
     * Add event
     * @param event
     * @param callback
     * @param priority
     * @return {hungObject}
     */
    on(event, callback, priority = 10){
        if(hung.isObject(event)){
            for(let _event in event){
                if(hung.isFunction(event[_event])){
                    this.on(_event, event[_event], priority);
                }
            }
            
            return this;
        }
        
        if(!this._events[event]){
            this._events[event] = [];
        }
        
        let context = null;
        if(hung.isArray(callback) && hung.isObject(callback[0]) && hung.isFunction(callback[1])){
            context = callback[0];
            callback = callback[1];
        }
        
        this._events[event].push({
            context,
            callback,
            priority
        });
        
        this._events[event].sort((a, b) => a.priority - b.priority);
        
        return this;
    }
    
    /**
     * Add event listener
     * @param event
     * @param callback
     * @param priority
     * @return {hungObject}
     */
    once(event, callback, priority = 10){
        if(hung.isObject(event)){
            for(let _event in event){
                if(hung.isFunction(event[_event]) || hung.isArray(event[_event])){
                    this.once(_event, event[_event], priority);
                }
            }
            
            return this;
        }
        
        let once = (...args) => {
            this.off(event, once);
            callback(...args);
        };
        
        this.on(event, once, priority);
        
        return this;
    }
    
    /**
     * Remove event
     * @param event
     * @param callback
     * @return {hungObject}
     */
    off(event, callback){
        if(!this._events[event]){
            return this;
        }
        
        if(!callback){
            delete this._events[event];
            return this;
        }
        
        lodash.remove(this._events[event], (item) => {
            return item.callback === callback;
        });
        
        this._events[event].sort((a, b) => a.priority - b.priority);
        return this;
    }
    
    /**
     * Emit event
     * @param event
     * @param args
     * @return {Promise<hungObject>}
     */
    emit(event, ...args){
        return new Promise((resolve, reject) => {
            try{
                
                if(!this._events[event]){
                    return resolve();
                }
                
                this._didemits[event] = true;
                let _calls = [];
                $.each(this._events[event], (item) => {
                    _calls.push((cb) => {
                        nextTick(async() => {
                            let context = item.context || hung;
                            let result = item.callback.apply(context, args);
                            if(hung.isPromise(result)){
                                try{
                                    result = await result;
                                    return cb(null, result);
                                }catch(e){
                                    return cb(e);
                                }
                            }
                            
                            cb(null, result);
                        });
                    });
                });
                
                parallel(_calls, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    
                    resolve(results);
                });
            }catch(e){
                return reject(e);
            }
        });
    }
    
    /**
     * Emit series event
     * @param event
     * @param args
     * @return {Promise<hungObject>}
     */
    emitSeries(event, ...args){
        return new Promise((resolve, reject) => {
            try{
                if(!this._events[event]){
                    return resolve();
                }
                
                this._didemits[event] = true;
                let _calls = [];
                $.each(this._events[event], (item) => {
                    _calls.push((cb) => {
                        nextTick(async() => {
                            let result = item.callback.apply(item.context || this, args);
                            if(hung.isPromise(result)){
                                try{
                                    result = await result;
                                    return cb(null, result);
                                }catch(e){
                                    return cb(e);
                                }
                            }
                            
                            cb(null, result);
                        });
                    });
                });
                
                async.series(_calls, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    
                    resolve(results);
                });
            }catch(e){
                return reject(e);
            }
        });
    }
    
    /**
     * Has event listener
     * @param event
     * @return {boolean}
     */
    hasListener(event){
        return !!this._events[event];
    }
    
    /**
     * Get event listener
     * @param event
     * @param callback
     * @return {unknown|boolean}
     */
    getListener(event, callback){
        if(!this._events[event]){
            return false;
        }
        
        return lodash.find(this._events[event], (item) => {
            return item.callback === callback;
        });
    }
    
    /**
     * Get event listeners
     * @param event
     * @return {*|*[]}
     */
    getListeners(event){
        if(!this._events[event]){
            return [];
        }
        
        return this._events[event];
    }
    
    /**
     * Get event listener callbacks
     * @param event
     * @return {any[]}
     */
    getListenerCallBacks(event){
        let listeners = this.getListeners(event);
        return lodash.map(listeners, (item) => {
            return item.callback;
        });
    }
    
    /**
     * Check event is done emit
     * @param event
     * @return {boolean}
     */
    isDidEmits(event){
        return !!this._didemits[event];
    }
    
    /**
     * Run callbacks in parallel
     * @param {Array} callbacks
     */
    parallel(callbacks){
        return new Promise((resolve, reject) => {
            let tasks = [];
            lodash.each(callbacks, (callback) => {
                tasks.push((cb) => {
                    nextTick(async() => {
                        try{
                            let context = null;
                            
                            if(hung.isArray(callback) && hung.isObject(callback[0]) && hung.isFunction(callback[1])){
                                context = callback[0];
                                callback = callback[1];
                            }
                            
                            let result = callback.apply(context || this, []);
                            
                            //is promise
                            if(hung.isPromise(result)){
                                try{
                                    result = await result;
                                }catch(e){
                                    return cb(e, null);
                                }
                            }
                            
                            cb(null, result);
                        }catch(e){
                            cb(e, null);
                        }
                    })
                });
            });
            
            parallel(tasks, (err, results) => {
                if(err){
                    return reject(err);
                }
                resolve(results);
            });
            
        });
    }
    
    /**
     * Exec functions in next tick
     * @return {Promise<unknown>}
     */
    go(...callbacks){
        if(callbacks.length === 1 && hung.isArray(callbacks[0])){
            callbacks = callbacks[0];
        }
        
        return new Promise((resolve, reject) => {
            nextTick(async() => {
                try{
                    resolve(await this.parallel(callbacks));
                }catch(e){
                    reject(e);
                }
            });
        });
    }
    
}

export default Eventobject;