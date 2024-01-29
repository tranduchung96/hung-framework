import {Mutex} from 'async-mutex';
import {nextTick} from 'async';

/**
 * Create a new parallel task runner
 * @param targetcallback
 * @param numtasks
 * @param options
 * @return {Paralleltasks}
 */
hung.createParallelTasks = function(targetcallback, numtasks, options){
    return new Paralleltasks(targetcallback, numtasks, options);
}

export default class Paralleltasks{
    
    //Min number of tasks to run
    _numtasks = 10;
    
    /**
     * Running tasks
     * @type {Array}
     * @private
     */
    tasks = [];
    
    /**
     * Task data to run
     * @type {[]}
     */
    taskdata = null;
    
    /**
     * Callback function to run
     * @type {Function}
     */
    taskcallback = null;
    
    /**
     * call back context
     * @type {null}
     */
    taskcontext = null;
    
    /**
     * Mutex lock
     * @type {Mutex}
     */
    mutex = null;
    
    /**
     * Continue run task flag
     * @type {boolean}
     */
    continue = true;
    
    /**
     * Create a new parallel task runner
     * @param {function|[Object, Function]} targetcallback
     * @param {number} numtasks
     * @param Object options
     */
    constructor(targetcallback = null, numtasks, options){
        
        //Init data
        this.taskdata = [];
        
        //Tasks
        this.tasks = [];
        
        if(hung.isPlainObject(targetcallback)){
            options = targetcallback;
            targetcallback = null;
        }
        
        if(options){
            if(options.numtasks){
                numtasks = options.numtasks;
            }
            
            if(options.data){
                this.data = options.data;
            }
            
            if(options.callback){
                this.setCallback(options.callback);
            }
            
            if(options.context){
                this.context = options.context;
            }
        }
        
        //Number of tasks
        if(numtasks){
            this._numtasks = parseInt(numtasks);
        }
        
        //set callback
        if(targetcallback){
            this.setCallback(targetcallback);
        }
        
    }
    
    /**
     * set number of tasks
     * @param numtasks
     */
    set numtasks(numtasks){
        this._numtasks = parseInt(numtasks);
    }
    
    /**
     * get number of tasks
     * @return {number}
     */
    get numtasks(){
        return this._numtasks;
    }
    
    /**
     * get callback of task
     * @return {null}
     */
    get callback(){
        return this.taskcallback;
    }
    
    /**
     * Set callback
     * @param callback
     */
    set callback(callback){
        this.setCallback(callback);
    }
    
    /**
     * get context of task
     * @return {null}
     */
    get context(){
        return this.taskcontext;
    }
    
    /**
     * Set context
     * @param context
     */
    set context(context){
        if(!hung.isObject(context)){
            throw new Error('Invalid context. Context must be an object');
        }
        
        this.taskcontext = context;
    }
    
    /**
     * Set data to task
     */
    set data(data){
        if(!hung.isArray(data)){
            throw new Error('Invalid data. Data must be an array');
        }
        
        this.taskdata = data;
    }
    
    /**
     * Get data of task
     */
    get data(){
        return this.taskdata;
    }
    
    /**
     * Get running tasks flag
     * @return {boolean}
     */
    get isContinue(){
        return this.continue;
    }
    
    /**
     * Set callbacl
     * @param targetcallback
     */
    setCallback(targetcallback){
        if(hung.isArray(targetcallback) && (targetcallback.length == 2) && hung.isObject(targetcallback[0])){
            this.taskcontext = targetcallback[0];
            let callback = targetcallback[1];
            if(hung.isString(callback) && hung.isFunction(this.taskcontext[callback])){
                this.taskcallback = this.taskcontext[callback];
            }else if(hung.isFunction(callback)){
                this.taskcallback = callback;
            }
        }else if(hung.isFunction(targetcallback)){
            this.taskcallback = targetcallback;
        }
        
        if(!this.taskcallback){
            throw new Error('Invalid callback. Call back must be a function or an object with two properties: callback and context');
        }
        
        return this;
    }
    
    /**
     * Submit data into tasks
     * @param task
     * @return {paralleltasks}
     */
    submit(data){
        
        //verify again task data type
        if(!Array.isArray(this.taskdata)){
            this.taskdata = [];
        }
        
        this.taskdata.push(data);
        
        if(this.tasks.length < this._numtasks){
            this._runatask();
        }
        
        return this;
    }
    
    /**
     * Start tasks
     * @return {Promise<void>}
     */
    async start(options){
        if(options.numtasks){
            this.numtasks = parseInt(options.numtasks);
        }
        
        if(options.data){
            this.data = options.data;
        }
        
        if(options.callback){
            this.setCallback(options.callback);
        }
        
        if(!this.taskcallback){
            throw new Error('No callback set');
        }
        
        //Run tasks
        for(let i = 0; i < this._numtasks; i++){
            this._runatask();
        }
        
        return this;
    }
    
    /**
     * Get number of tasks
     * @return {number}
     */
    get count(){
        if(!hung.isArray(this.taskdata)){
            return 0;
        }
        
        return this.taskdata.length;
    }
    
    /**
     * Get number of running tasks
     * @return {number}
     */
    get running(){
        if(!hung.isArray(this.tasks)){
            return 0;
        }
        
        return this.tasks.length;
    }
    
    /**
     * is running tasks
     * @return {boolean}
     */
    get isRunning(){
        return this.running > 0;
    }
    
    /**
     * Clear data
     * @return {paralleltasks}
     */
    clear(){
        this.taskdata = [];
        return this;
    }
    
    /**
     * Wait for all tasks to finish
     */
    async wait(){
        if(!this.isRunning){
            return;
        }
        
        //Wait for all tasks to finish
        await Promise.all(this.tasks);
        this.tasks = [];
    }
    
    /**
     * Close tasks
     */
    async stop(){
        this.continue = false;
        await this.wait();
    }
    
    /**
     * Execute a task
     * @private
     */
    async _execute(){
        if(!this.count){
            return;
        }
        
        while(this.continue && this.taskdata.length > 0){
            try{
                let release = await this.mutex.acquire();
                let data = this.taskdata.shift();
                release();
                await new Promise(async(resolve, reject) => {
                    let isresolved = false;
                    try{
                        let result = this.taskcallback.apply(this.taskcontext || this, [data]);
                        if(hung.isPromise(result)){
                            await result;
                        }
                        resolve();
                        isresolved = true;
                    }catch(e){
                        reject(e);
                    }finally{
                        if(!isresolved){
                            resolve();
                        }
                    }
                });
            }catch(e){
                hung.log_error(e);
            }
        }
    }
    
    /**
     * Run a task
     * @private
     */
    _runatask(){
        if(!this.continue){
            return;
        }
        
        if(this.tasks.length >= this._numtasks){
            return;
        }
        
        if(!this.taskcallback){
            throw new Error('No callback set');
        }
        
        if(!this.mutex){
            this.mutex = new Mutex();
        }
        
        let task;
        //Create a task
        task = new Promise((resolve, reject) => {
            nextTick(async() => {
                try{
                    await this._execute();
                    resolve();
                }catch(e){
                    reject(e);
                }finally{
                    
                    //Remove task from running tasks list when task is finished
                    let index = this.tasks.indexOf(task);
                    if(index > -1){
                        this.tasks.splice(index, 1);
                    }
                }
            });
        });
        
        this.tasks.push(task);
        return task;
    }
    
}