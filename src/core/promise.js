import util from 'util';

/**
 * Create new promise
 * @return {Promise<*>}
 * @param cb
 */
hung.promise = function(cb){
    return new Promise(cb);
};

/**
 * Promise.all
 * @param args
 */
hung.all = function(promises){
    return Promise.all(promises);
};

/**
 * Promise series
 * @param {[Promise]} promises
 */
hung.series = function(promises){
    return hung.promise(async(resolve, reject) => {
        try{
            if(hung.isObject(promises)){
                let results = {};
                for(let key in promises){
                    results[key] = await promises[key];
                }
                resolve(results);
            }else{
                let results = [];
                for(let promise of promises){
                    results.push(await promise);
                }
                resolve(results);
            }
        }catch(e){
            reject(e);
        }
    });
};

//Promisify
hung.promisify = util.promisify;