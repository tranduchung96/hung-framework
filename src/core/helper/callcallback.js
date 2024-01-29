/**
 * Wrap callback to promise
 * @param cb
 * @param args
 * @return {Promise<*>}
 */
export default function callcallback(cb, ...args){
    return hung.promise((resolve, reject) => {
        try{
            if(!hung.isFunction(cb)){
                return resolve();
            }
            
            let result = cb(...args);
            if(hung.isPromise(result)){
                result.then((data) => {
                    resolve(data);
                }).catch((e) => {
                    reject(e);
                });
            }else{
                resolve(result);
            }
        }catch(e){
            reject(e);
        }
    });
};