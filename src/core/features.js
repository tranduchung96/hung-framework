import async from 'async';

const DEFAULT_PRIORITY = 10;

/**
 * Feature set
 */
class FeatureSet{
    
    /**
     * List of features
     * @type {{}}
     * @private
     */
    _features = [];
    
    /**
     * List of callbacks
     * @type {{}}
     * @private
     */
    _callbacks = {};
    
    constructor(...features){
        if(features.length > 0){
            this.addFeatures(...features);
        }
    }
    
    /**
     * Add feature
     * @param feature
     * @param priority
     * @return {Features}
     */
    addFeature(feature, priority = DEFAULT_PRIORITY, sort = true){
        this._features.push({feature, priority});
        if(sort){
            this._features.sort((a, b) => a.priority - b.priority);
        }
        return this;
    }
    
    /**
     * Add features
     * @param features[{feature, priority}]
     * @return {Features}
     */
    addFeatures(...features){
        features.forEach(([feature, priority]) => this.addFeature(feature, priority, false));
        thi._features.sort((a, b) => a.priority - b.priority);
        return this;
    }
    
    /**
     * Import features from path
     */
    async importPath(path){
        await hung.importPath(path, (module) => {
            this.importModule(module);
        });
    }
    
    /**
     * Import module
     * @param module
     * @private
     */
    importModule(module){
        this.addFeature(module, module.priority || DEFAULT_PRIORITY);
        return this;
    }
    
    /**
     * get callbacks in feature set
     * @param name
     * @return {*}
     */
    getCallbacks(name){
        if(this._callbacks[name]){
            return this._callbacks[name];
        }
        
        let callbacks = [];
        this._features.forEach(({feature}) => {
            let callback = feature[name];
            if(hung.isFunction(callback)){
                callbacks.push(callback);
            }
        });
        
        this._callbacks[name] = callbacks;
        return callbacks;
    }
    
    /**
     * Apply method to all features without exit on error. all features run on one by one
     * @param args
     * @return {Features}
     */
    async apply(name, ...args){
        return new Promise(async(resolve, reject) => {
            try{
                let callbacks = this.getCallbacks(name);
                if(!callbacks.length){
                    return resolve();
                }
                
                let tasks = [];
                for(let callback of callbacks){
                    tasks.push((cb) => {
                        process.nextTick(async() => {
                            try{
                                cb(null, await hung.callback(callback, ...args));
                            }catch(e){
                                hung.log_error(e);
                                cb(null, null);
                            }
                        })
                    });
                }
                
                await async.series(tasks, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(results.filter(result => result !== null));
                });
            }catch(e){
                reject(e);
            }
        });
    }
    
    /**
     * Apply method to all features with not exit on error. all features run on parallel
     * @param name
     * @param args
     * @return {Promise<unknown>}
     */
    async applyParallel(name, ...args){
        return new Promise(async(resolve, reject) => {
            try{
                let callbacks = this.getCallbacks(name);
                
                if(!callbacks.length){
                    return resolve();
                }
                
                let tasks = [];
                for(let callback of callbacks){
                    tasks.push((cb) => {
                        process.nextTick(async() => {
                            try{
                                cb(null, await hung.callback(callback, ...args));
                            }catch(e){
                                hung.log_error(e);
                                cb(null, null);
                            }
                        })
                    });
                }
                
                await async.parallel(tasks, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(results.filter(result => result !== null));
                });
            }catch(e){
                reject(e);
            }
        });
    }
    
    /**
     * Apply name of features and get results
     * @param name
     * @param arsg
     * @return {Promise<*>
     */
    get(name, ...args){
        return new Promise(async(resolve, reject) => {
            try{
                let callbacks = this.getCallbacks(name);
                
                if(!callbacks.length){
                    return resolve();
                }
                
                let tasks = [];
                for(let callback of callbacks){
                    tasks.push((cb) => {
                        process.nextTick(async() => {
                            try{
                                cb(null, await hung.callback(callback, ...args));
                            }catch(e){
                                hung.log_error(e);
                                cb(e, null);
                            }
                        })
                    });
                }
                
                await async.parallel(tasks, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(results.filter(result => result !== null));
                });
            }catch(e){
                reject(e);
            }
        });
    }
    
    /**
     * Apply name of features and get result if result is not null. If result is null, continue to apply next feature
     * @param args
     * @return {Promise<*>}
     */
    async getIfResult(name, ...args){
        let callbacks = this.getCallbacks(name);
        if(!callbacks.length){
            return null;
        }
        
        for(let callback of callbacks){
            try{
                let results = await hung.callback(callback, ...args);
                if(results !== null && results !== undefined){
                    return results;
                }
            }catch(e){
                if(!hung.isInvalidArgumentError(e)){
                    hung.log_error(e);
                }
            }
        }
        
        return null;
    }
    
}

/**
 * Feature set
 * @type {{}}
 */
hung.features = {
    
    FeatureSet: FeatureSet,
    
    /**
     * Create feature set
     * @param features
     * @return {FeatureSet}
     */
    create(...features){
        return new FeatureSet(...features);
    },
    
    /**
     * Import features from path
     * @param path
     * @return {Promise<FeatureSet>}
     */
    async imports(...path){
        let featureset = new FeatureSet();
        await featureset.importPath(hung.path.join(...path));
        return featureset;
    }
    
};