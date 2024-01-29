/**
 * Parallelcaller
 * @return {Parallelcaller}
 */
hung.createParallelcaller = function(){
    return new Parallelcaller();
}

/**
 * Parallelcaller
 */
class Parallelcaller{
    
    calltasks = [];
    
    /**
     * Push and run task
     * @param task
     */
    call(cb, ...args){
        let task = new Promise((resolve, reject) => {
            process.nextTick(async() => {
                try{
                    if(hung.isPromise(cb)){
                        return cb.then(resolve).catch(reject);
                    }
                    
                    let {context, callback} = hung.getContextCallback(cb, this);
                    let result = await callback.apply(context, args);
                    if(hung.isPromise(result)){
                        return result.then(resolve).catch(reject);
                    }
                    
                    resolve(result);
                }catch(e){
                    reject(e);
                }
            });
        });
        
        this.calltasks.push(task);
    }
    
    /**
     * Wait all tasks
     */
    async wait(){
        await Promise.all(this.calltasks);
        this.calltasks = [];
        return this;
    }
    
}