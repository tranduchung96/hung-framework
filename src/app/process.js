import lodash from "lodash";
import cluster from "cluster";
import pidusage from "pidusage";

const debug = hung.createDebug('hung:app:process');

//Init process
debug("Load Process");

//Shutting down
hung.isshutdown = false;
hung.isdebugmode = process.env.DEBUGMODE === 'true';

if(debug.enabled){
    debug("Process id:", process.pid);
}

//Process overhead memory usage
let MAX_MEMORY_USAGE_ALLOWS = app.get('max_memory_allow_per_worker_process', 0);
if(MAX_MEMORY_USAGE_ALLOWS > 0 && cluster.isWorker){
    if(debug.enabled) debug("Max memory usage allows: %s mb", MAX_MEMORY_USAGE_ALLOWS);
    MAX_MEMORY_USAGE_ALLOWS = hung.filesizes.mbtoBytes(MAX_MEMORY_USAGE_ALLOWS);
    
    setInterval(async function(){
        try{
            let memoryusage = process.memoryUsage();
            if(memoryusage.heapUsed > MAX_MEMORY_USAGE_ALLOWS){
                if(debug.enabled) debug("Overhead memory usage: %s mb", hung.filesizes.toMb(memoryusage.heapUsed));
                await app.shutdown();
            }
            
            let stats = await pidusage(process.pid);
            if(stats.memory > MAX_MEMORY_USAGE_ALLOWS){
                if(debug.enabled) debug("Overhead memory usage: %s mb", hung.filesizes.toMb(stats.memory));
                await app.shutdown();
            }
        }catch(e){
            hung.log_error(e);
        }
    }, 3000);
    
}

//Set app process name
hung.set_app_process_name();

//Termite app
async function termiteApp(){
    if(debug.enabled){
        debug("Termite app");
    }
    
    await app.shutdown();
}

/**
 * On exit app
 */
async function onExitApp(){
    debug("Shutdown");
    hung.isshutdown = true;
    await hung.emit('shutdown');
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', termiteApp)
       .on('SIGTERM', termiteApp)
       .on('exit', onExitApp);

//Check is children process or not
process.isParentProcess = !process.env.parent_process_pid;

//Process event handlers
process.on('message', async function(data){
    let action = data.action;
    data = lodash.omit(data, ['action']);
    await hung.dispatchProcessAction(action, data.data || data);
});

/**
 * Submit task  action to parent process
 * @param task
 * @param action
 * @param data
 * @returns {Promise<void>}
 */
hung.submit = function(action, data){
    new Promise(async(resolve, reject) => {
        data = data || {};
        if(cluster.isWorker){
            try{
                await app.submit(action, data);
                resolve();
            }catch(e){
                hung.log_error(e);
                reject(e);
            }
        }
    });
}