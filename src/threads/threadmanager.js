import Thread from './thread.js';
import {EventEmitter} from 'events';

/**
 * Thread pool manager
 */
class ThreadManager extends EventEmitter{
    
    task = null;
    threads = [];
    
    /**
     * Start threads number
     * @type {number}
     */
    start = 0;
    
    /**
     * Max threads number will be created
     * @type {number}
     */
    maxthreads = 0;
    
    /**
     * Worker data
     * @type {null}
     */
    data = null;
    
    /**
     * Create a new thread manager
     * @param options
     */
    constructor(options){
        super();
        
        this.start = options.start || 0;
        this.maxthreads = options.maxthreads || 0;
        this.task = options.task;
        this.options = options;
        this.data = options.data || null;
        
        //Remove unused options
        delete options.task;
        delete options.start;
        delete options.maxthreads;
        delete options.data;
        
        //Create threads
        this._startThreads();
    }
    
    /**
     * Start the process of creating threads
     */
    async exec(params, transferList){
        try{
            let thread = this._getIdealThread();
            return await thread.run(params, transferList);
        }catch(e){
            hung.log_error(e);
            if(thread){
                this._replaceThread(thread);
            }
        }
    }
    
    /**
     * Stop all threads
     */
    async stop(){
        for(let thread of this.threads){
            await thread.terminate();
        }
        
        this.threads = [];
        this.emit('stop');
        this.removeAllListeners();
        return this;
    }
    
    /**
     * Start the process of creating threads
     * @private
     */
    _startThreads(){
        this.threads = [];
        if(this.start > 0){
            for(let i = 0; i < this.start; i++){
                this._createThread();
            }
        }
    }
    
    /**
     * Create a new thread
     * @return {Thread}
     */
    _createThread(){
        let thread = new Thread(this.task, {
            ...this.options,
            workerData: this.data
        });
        this.threads.push(thread);
        return thread;
    }
    
    /**
     * get Ide thread to exceute task
     * @return {Thread}
     * @private
     */
    _getIdealThread(){
        let thread = this.threads.find(thread => thread.ready);
        if(!thread && (this.threads.length < this.maxthreads || this.maxthreads === 0)){
            thread = this._createThread();
        }
        
        return thread;
    }
    
    /**
     * Replace a thread
     * @param thread
     * @private
     */
    _replaceThread(thread){
        let index = this.threads.indexOf(thread);
        if(index > -1){
            this.threads.splice(index, 1);
        }
        this._createThread();
    }
    
}

/**
 * Create a new thread manager
 * @param options
 * @return {ThreadManager}
 */
hung.createThreadPoolManager = function(options){
    return new ThreadManager(options);
}

export default ThreadManager;