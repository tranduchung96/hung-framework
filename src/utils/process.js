import {fork, ChildProcess, exec} from 'child_process';
import os from 'os';
import cluster from "cluster";
import lodash from "lodash";

const debug = hung.createDebug('hung:process');

/**
 * Set app process name
 * @param name
 */
hung.set_app_process_name = function(name = null){
    if(hung.isdebugmode || hung.is_development){
//        return;
    }
    
    let newname = 'node';
    const appname = hung.settings.app.app_name || null;
    if(appname){
        newname += '_' + appname;
    }
    
    if(name && appname && name != appname){
        newname += '_' + name;
    }
    
    debug("Set name: %s to process id: %s", newname, process.pid);
    process.title = newname;
}

/**
 * Start process
 * @param {Object} args
 * @param env Environment variables
 * @return ChildProcess
 */
hung.start_app_process = function(task, env = {}){
    debug('Start task process: ', task);
    
    //Fix options
    env = env || {};
    
    let commandstr = ['--type=' + task], args;
    
    //Set args
    args = env.args || {};
    if(env.args){
        delete env.args;
    }
    
    if(lodash.isPlainObject(args) && Object.keys(args).length > 0){
        lodash.forEach(args, (value, key) => {
            commandstr.push('--' + key + '=' + value);
        });
    }
    
    //set defaults process env
    env.parent_process_pid = process.pid;
    env.run_task_process = task;
    hung.defaults(env, process.env);
    
    //Start process
    let childprocess = fork(hung.__main__, commandstr, {env: env});
    childprocess.isexit = false;
    childprocess.on('exit', (message) => {
        debug('Child process exit with message:', message);
        childprocess.isexit = true;
    });
    
    return childprocess;
}

/**
 * OS Fork
 * @param options
 * @return {ChildProcess}
 */
hung.startWorkerProcess = async function(task, options = null, instances = null){
    options = options || {};
    hung.defaults(options, process.env);
    options.parent_process_pid = process.pid;
    
    //Restart on exit
    const isrestartonexit = options.restartonexit || true;
    
    //Cluster task
    task = task || options.run_task_process || options.name || null;
    if(options.run_task_process && options.run_task_process != task){
        options.run_task_process = task;
    }
    
    if(!options.run_task_process && task){
        options.run_task_process = task;
    }
    
    let childs = {};
    let startinstances = instances || options.instances || 1;
    for(let i = 0; i < startinstances; i++){
        let childprocess = cluster.fork(options);
        childprocess.isexit = false;
        childprocess.on('exit', async(code) => {
            debug('Fork child process exit with code:', code);
            
            if(code > 0){
                return;
            }
            
            //Restart current child process
            if(!hung.isshutdown && isrestartonexit && (options.started || 0) < hung.app.max_restart_process){
                debug('Restart child process');
                let restartprocess = hung.startWorkerProcess(task, options, 1);
                if(restartprocess){
                    for(let idx in restartprocess){
                        childs[i] = restartprocess[idx];
                        childs[i].started++;
                        if(hung.app){
                            await hung.app.add_running_process(task, restartprocess);
                        }
                        break;
                    }
                }
            }
            
            childprocess.isexit = true;
        });
        
        //Add to running process
        if(hung.app){
            await hung.app.add_running_process(task, childprocess);
        }
        
        childs[i] = {
            childprocess,
            started: 0
        };
    }
    
    return childs;
}

/**
 * Check is primary process
 */
hung.is_primary_process = function(){
    if(process.env.parent_process_pid){
        return false;
    }
    
    return process.isParentProcess || !cluster.isWorker;
}
/**
 * Check is child process
 * @return {boolean}
 */
hung.is_child_process = function(){
    return !!process.env.parent_process_pid;
}