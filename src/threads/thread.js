import {Worker} from 'worker_threads';

/**
 * Create a new thread
 */
class Thread extends Worker{
    
    _ready = false;
    
    _isIde = true;
    
    /**
     * Create a new thread
     * @param task
     */
    constructor(...args){
        super(...args);
        this.once('online', () => {
            this.setReady(true);
        });
    }
    
    /**
     * Check if the thread is ready
     * @return {boolean}
     */
    get ready(){
        return this._ready && this._isIde;
    }
    
    /**
     * Set ready state
     * @param ready
     */
    setReady(ready = true){
        this._ready = ready;
        this._isIde = ready;
        return this;
    }
    
    /**
     * Run the thread
     * @param args
     * @return {Promise<void>}
     */
    async run(params, transferList){
        this._isIde = false;
        return new Promise(async(resolve, reject) => {
            let onMessage = (message) => {
                this.removeListener('error', onError);
                this._isIde = true;
                resolve(message);
            };
            
            let onError = (error) => {
                this.removeListener('message', onMessage);
                this._isIde = true;
                reject(error);
            };
            
            this.once('message', onMessage);
            this.once('error', onError);
            this.postMessage(params, transferList);
        });
    }
    
    /**
     * Terminate the thread
     * @return {Promise<void>}
     */
    async terminate(){
        this.once('exit', () => {
            setImmediate(() => {
                this.removeAllListeners();
            });
        });
        
        await super.terminate();
        this.setReady(false);
        return this;
    }
    
}

/**
 * Create a new thread
 * @param {string|URL|EventEmitterOptions} task
 * @param {WorkerOptions[][]} args
 * @return {Thread}
 */
hung.createThread = function(task, ...args){
    return new Thread(task, ...args);
}

export default Thread;