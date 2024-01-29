/**
 * Wait for a certain amount of time
 * @param ms
 * @param callback
 * @return {Promise<*>}
 */
hung.wait = function wait(ms = 0, callback){
    return new Promise(async(resolve, reject) => {
        setTimeout(async() => {
            if(hung.isFunction(callback)){
                try{
                    resolve(await hung.callback(callback));
                }catch(e){
                    reject(e);
                }
            }
            
            resolve();
        }, ms);
    });
};