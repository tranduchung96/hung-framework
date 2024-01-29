import cluster from "cluster";
import os from "os";
const require = hung.createRequire(import.meta.url);

let debug = require('debug')('hung:App:Master');

//Run instances
let instances = hung.env('WEB_INSTANCE') || hung.app.get('web_instance');
if(instances == 0){
    instances = Math.min(hung.consts.WEB_INSTANCE, hung.consts.CPU_CORES * 4);
}

export {instances};

/**
 * Start web server
 */
export default async function(){
    debug('Start web server...');
    await import('./webserver.js');
};