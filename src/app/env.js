import yargs from 'yargs';
import lodash from "lodash";
import os from "os";

const debug = hung.require('debug')('hung:bootstrap:env');

//Load app env
debug('Load app env');
import dotenv from 'dotenv';

//Environtment variables
const argv = {};

//Parse .env file
hung.forIn(dotenv.config().parsed, (value, key) => {
    if(hung.isNumerric(value)){
        process.env[key] = process.env[key] || lodash.toInteger(value);
    }
});

//Node env
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

//IS Development Flag
hung.is_development = process.env.NODE_ENV === "development";
debug(hung.is_development ? 'Run app in development mode' : 'Run app in production mode');

//Auto set thread pool size
if(process.env.UV_THREADPOOL_SIZE == 0){
    process.env.UV_THREADPOOL_SIZE = Math.min(64, os.cpus().length * 4);
}

//Parse process argv
debug('Parse process argv');
hung.forIn(yargs(process.argv).argv, (value, key) => {
    if(key === '_' || key === '$0'){
        delete argv[key];
        return;
    }
    
    if(hung.isNumerric(value)){
        value = lodash.toInteger(value);
    }
    
    argv[key] = value;
});

hung.args = argv;

/**
 * Get env value
 * @param name
 * @return {*}
 */
hung.env = function(name = null, defaultvalue = null){
    if(name){
        return process.env[name] || defaultvalue;
    }
    
    return process.env;
}