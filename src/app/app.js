//Load libs
import fs from "fs";
import lodash from "lodash";
import Eventobject from "../core/helper/eventobject.js";
import Optionshandler from "./helper/optionshandler.js";

const debug = hung.createDebug('hung:app:main');

debug('Load hungApp class');

/**
 * @class App
 */
export default class App extends Eventobject{
    
    //options
    options = new Optionshandler();
    
    /**
     * App boot error
     * @type {boolean}
     */
    booterror = false;
    
    /**
     * App boot complete
     * @type {boolean}
     */
    bootcomplete = false;
    
    /**
     * List of tasks
     * @type {{}}
     */
    taskprocess = {};
    
    /**
     * Modules loaded
     * @type {{}}
     */
    modules = {};
    
    /**
     * Max restart process
     * @type {number}
     */
    max_restart_process = 10;
    
    /**
     * List of running process
     * @type Object
     */
    listprocess = {};
    
    /**
     * App params
     * @type {Map<string, any>}
     */
    params = new Map();
    
    /**
     * App constructor
     */
    constructor(){
        super();
    }
    
    /**
     * App Initialize
     */
    init(){
        this.max_restart_process = hung.settings.app.max_restart_process || this.max_restart_process;
    }
    
    /**
     * Options is read only
     * @param value
     */
    set options(value){
        throw new Error('App options is read only');
    }
    
    /**
     * get app variable or setttings
     * @param name
     * @param value Default value
     * @return {*}
     */
    get(name, value = null){
        if(this.params.has(name)){
            return this.params.get(name);
        }
        
        //Get from settings
        let result = hung.get(hung.settings.app || {}, name);
        if(result !== undefined){
            return result;
        }
        
        return value;
    }
    
    /**
     * Add a process
     * @param name Task name
     * @param options Task options or handler
     * @param handler Task handler
     * @return {Promise<this>}
     */
    async add_task_process(name, handler, taskoptions){
        if(!hung.isFunction(handler)){
            throw new Error('Task handler must be a function');
        }
        
        if(debug.enabled){
            debug("Add task process: " + name);
        }
        
        //Fix args
        let options = {};
        if(taskoptions){
            
            if(taskoptions.args){
                options.args = taskoptions.args;
            }
            
            if(taskoptions.instances){
                options.instances = taskoptions.instances;
            }
        }
        
        options.args = options.args || {};
        
        //Default handler params
        if(!this.taskprocess[name]){
            this.taskprocess[name] = {
                name: name,
                started: 0,
                instances: 1,
                args: {},
                options: {},
                handler: []
            };
        }
        
        //Add options
        hung.extend(this.taskprocess[name].options.args, options.args);
        hung.extend(this.taskprocess[name].options, options);
        
        //Instance
        if(options.instances){
            this.taskprocess[name].instances = options.instances;
        }
        
        //Add handlers
        this.taskprocess[name].handler.push(handler);
        
        return this;
    }
    
    /**
     * Load module
     * @param {string} moduleName
     * @return {Promise<this>}
     */
    async loadModule(moduleName){
        if(this.modules[moduleName]){
            return this;
        }
        
        let moduledir = hung.path.join(hung.__dirmodules, moduleName);
        let modulebootstrap = hung.path.join(moduledir, "bootstrap.js");
        let moduleviewpath = hung.path.join(moduledir, "views");
        if(fs.existsSync(modulebootstrap)){
            this.modules[moduleName] = true;
            
            //Load module bootstrap
            debug("Load module: " + moduleName);
            await hung.importFile(modulebootstrap);
            
            //Load module views
            if(fs.existsSync(moduleviewpath)){
                hung.views.paths.push(moduleviewpath);
            }
            
            return this;
        }
        
        debug("Module: " + moduleName + " not found or not valid");
        return this;
    }
    
    /**
     * Delete running process
     * @param name
     * @return {Promise<this>}
     */
    async delete_running_process(name, process){
        debug('Delete running process: ' + name);
        if(!this.listprocess[name]){
            return this;
        }
        
        //Remove all listeners
        process.removeAllListeners();
        
        let index = lodash.findIndex(this.listprocess[name], {name, process});
        if(index !== -1){
            this.listprocess[name].splice(index, 1);
        }
        
        return this;
    }
    
    /**
     * Add running process
     * @param name
     * @param {ChildProcess|Worker} workerprocess
     * @return {Promise<void>}
     */
    async add_running_process(name, workerprocess){
        debug('Add running process: ' + name);
        if(!this.listprocess[name]){
            this.listprocess[name] = [];
        }
        
        //Add listener
        workerprocess.on('exit', (code, signal) => {
            this.delete_running_process(name, workerprocess);
        });
        
        //Add message listener
        workerprocess.on('message', async(data) => {
            let sent,
                action = data.action || null,
                parts  = action.split(':'),
                task   = parts.shift();
            
            //Send task events
            
            data.pid = process.pid;
            
            if(action && task){
                sent = await this.sendTaskMessage(task, data);
            }
            
            if(!sent){
                this.dispatch_process_action(action, data);
            }
        });
        
        //Add to list
        this.listprocess[name].push({name, process: workerprocess});
        
        return this;
    }
    
    /**
     * Start app
     */
    async start(name = null){
        debug('Starting app...');
        hung.emit('appstart');
        
        debug('App started');
        hung.emit('appstarted');
        
        //Load task process
        await this.loadTaskProcess();
        
        //If not parent process
        if(!hung.is_primary_process() || process.env.run_task_process || name){
            return await this.dispatchTask(name || process.env.run_task_process);
        }
        
        //Start processes
        name = name || hung.args.type || process.env.run_task_process || null;
        if(name){
            return this.startProcessTask(name);
        }
        
        //Start all processes
        if(Object.keys(this.taskprocess).length === 0){
            debug('No task process found. app can not start');
            return this;
        }
        
        //Start all processes
        debug('Start all task processes');
        for(let name in this.taskprocess){
            await this.startProcessTask(name);
        }
        
        //ready app
        await this.ready();
        
        return this;
    }
    
    /**
     * Start process name
     * @param name
     */
    async startProcessTask(name){
        let processdata = this.taskprocess[name];
        if(!processdata){
            debug('Task process: ' + name + ' not found. app can not start');
            return;
        }
        
        //Start process
        if(debug.enabled) debug('Start task process: ', {name});
        await hung.startWorkerProcess(name, processdata.options || {});
        return this;
    }
    
    /**
     * Run worker
     * @param name
     * @private
     */
    async dispatchTask(name){
        debug('Dispatch task: ' + name);
        name = name || process.env.run_task_process || hung.args.type || null;
        if(!name){
            throw new Error('Process name is empty. app can not start');
        }
        
        if(this.taskprocess[name]){
            return await this.dispatch_app_task(name);
        }
        
        //App error handler
        throw new Error('Process name not found');
    }
    
    /**
     * Dispatch all commons tasks
     */
    dispatchCommonsTask(){
        debug('Dispatch commons tasks');
        hung.emit('dispatch_commons_task', this);
    }
    
    /**
     * Start process name
     * @param name
     * @private
     */
    async dispatch_app_task(name){
        debug('Dispatch task handler: ' + name);
        let processdata = this.taskprocess[name];
        
        if(!processdata){
            debug('Process: ' + name + ' not found. app can not start');
            return false;
        }
        
        //Change process title
        hung.set_app_process_name(name);
        
        //Trigger event load app task
        hung.emit('load_app_task_' + name, this);
        
        //Process handler
        if(processdata.handler.length){
            for(const handler of processdata.handler){
                if(lodash.isFunction(handler)){
                    process.nextTick(async() => {
                        handler.apply(this);
                    });
                }
            }
        }
        
        //Emit events
        hung.emit('dispatch_app_task_' + name, this);
        
        //Mark app as ready
        this.ready();
        
        return true;
    }
    
    /**
     * Dispatch process action
     * @param action
     * @param data
     */
    async dispatch_process_action(action, data){
        action = action.replace(/\//g, ':');
        await hung.dispatchProcessAction(action, data);
        return this;
    }
    
    /**
     * Load task process from modules
     * @private
     */
    async loadTaskProcess(){
        debug('Load task process');
        for(let moduleName in this.modules){
            debug('Load task process of module: ' + moduleName);
            let taskdir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, 'taskprocess'));
            if(taskdir && hung.fs.existsSync(taskdir)){
                
                //Load init file
                let initfile = hung.path.join(taskdir, 'init.js');
                if(hung.fs.existsSync(initfile)){
                    debug('Load task process init file: ' + initfile);
                    await hung.importFile(initfile);
                }
                
                let items = hung.globSync('*.js', {cwd: taskdir});
                if(items && items.length){
                    for(let name of items){
                        
                        //Skip init file
                        if(name === 'init.js'){
                            continue;
                        }
                        
                        let filepath = hung.path.join(taskdir, name),
                            basename = hung.path.basename(filepath, hung.path.extname(filepath));
                        
                        debug('Load task process file: ' + filepath);
                        let module = await hung.importFile(filepath);
                        if(hung.isFunction(module.default)){
                            await this.add_task_process(basename, module.default, module);
                        }
                    }
                }
                
                //Load task process actions
                debug('Load task process actions of module: ' + moduleName);
                let actionsdir = hung.path.resolve(hung.path.join(taskdir, 'actions'));
                if(actionsdir && hung.fs.existsSync(actionsdir)){
                    let items = hung.globSync('**/*.js', {cwd: actionsdir});
                    if(items && items.length){
                        for(let name of items){
                            let filepath   = hung.path.join(actionsdir, name),
                                actionname = name.replace(/\.js$/i, '');
                            
                            actionname = actionname.replace(/\//g, ':');
                            debug('Load task process action:', actionname);
                            let module = await hung.importFile(filepath);
                            
                            if(module.default && hung.isFunction(module.default)){
                                this.add_task_process_action(actionname, module.default);
                            }
                        }
                    }
                }
                
            }
        }
    }
    
    /**
     * Import module
     * @param {string} namespace
     * @param {Function} loadcallback
     */
    async loadModulesComponents(namespace, loadcallback){
        let iscallback = hung.isFunction(loadcallback);
        for(let moduleName in this.modules){
            debug(`Load ${namespace} of module: ${moduleName}`);
            let taskdir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, namespace));
            if(taskdir && hung.fs.existsSync(taskdir)){
                
                //Load init file
                let initfile = hung.path.join(taskdir, 'init.js');
                if(hung.fs.existsSync(initfile)){
                    debug(`Load ${moduleName}/${namespace} init file path: %s`, initfile);
                    await hung.importFile(initfile);
                }
                
                let items = hung.globSync('*.js', {cwd: taskdir});
                if(items && items.length){
                    for(let name of items){
                        //Skip init file
                        if(name === 'init.js'){
                            continue;
                        }
                        
                        let filepath = hung.path.join(taskdir, name);
                        debug(`Load ${moduleName}/${namespace} in file path: %s`, filepath);
                        let moduleloaded = await hung.importFile(filepath);
                        let handler = moduleloaded.default;
                        let basename = hung.path.basename(filepath, hung.path.extname(filepath));
                        if(iscallback && handler && hung.isFunction(handler)){
                            let results = loadcallback({handler, moduleName, basename, filepath, moduleloaded});
                            if(results.then && hung.isFunction(results.then)){
                                await results;
                            }
                        }
                        
                    }
                }
            }
        }
    }
    
    /**
     * Add task process action
     * @return {Promise<this>}
     */
    async add_task_process_action(action, callback){
        debug('Add task process action: %s', action);
        let parts = action.split(':'),
            task  = parts.shift();
        
        if(!this.taskprocess[task]){
            debug('Task process: %s not found for action: %s', task, action);
        }
        
        hung.onProcessAction(action, callback);
        return this;
    }
    
    /**
     * Send task message
     * @param task
     * @param data
     * @return {Promise<this>}
     */
    async sendTaskMessage(task, data){
        debug('Send task message: %s', task);
        if(this.listprocess[task]){
            for(let {process} of this.listprocess[task]){
                process.send(data);
            }
            return this;
        }
        return false;
    }
    
    /**
     * Shutdown app
     * @return {Promise<void>}
     */
    async shutdown(restart = false){
        hung.isshutdown = true;
        restart ? debug('Restart app') : debug('Shutdown app');
        
        //Shutdown app
        debug('Before shutdown event');
        await hung.emit('beforeshutdown');
        
        //Shutdown app
        debug('Trigger shutdown event');
        await hung.emit('shutdown');
        
        //Shutdown all processes
        debug('Shutdown all processes');
        for(let name in this.listprocess){
            await this.shutdownProcess(name);
        }
        
        debug('App shutdown');
        process.exit(0);
    }
    
    /**
     * Shutdown process
     * @param name
     * @return {Promise<void>}
     */
    async shutdownProcess(name){
        debug('Shutdown process: ' + name);
        if(!this.listprocess[name]){
            return this;
        }
        
        //Shutdown all processes
        for(let {process} of this.listprocess[name]){
            await this.shutdownWorkerProcess(process);
        }
        
        return this;
    }
    
    /**
     * Shutdown worker process
     * @param {ChildProcess|Worker} workerprocess
     * @return {Promise<void>}
     */
    async shutdownWorkerProcess(workerprocess){
        debug('Shutdown worker process');
        if(!workerprocess){
            return this;
        }
        
        //Shutdown process
        workerprocess.isexit = true;
        workerprocess.removeAllListeners();
        workerprocess.kill();
        
        return this;
    }
    
    /**
     * App ready
     */
    async ready(){
        debug('App ready');
        await hung.emit('ready');
    }
    
    /**
     * Submit action to task process from worker process
     * @param action
     * @param data
     * @return {Promise<void>}
     */
    async submit(action, data){
        let task = action.split(':').shift();
        if(!this.taskprocess[task]){
            throw new Error('Task process not found');
        }
        
        if(debug.enabled){
            debug("Sumit task action: ", action);
        }
        
        //Send message
        process.send({action, data});
        
        return this;
    }
    
}