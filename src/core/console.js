import hung from './core.js';
import util from 'util';
import debug from 'debug';

const log = debug('hung:console');

console.debug = function(obj){
    log(util.inspect(obj, {
        colors: true,
        depth: null,
        maxArrayLength: null,
    }));
};

/**
 * Log with format string
 */
console.logf = function(msg){
    if(arguments.length > 1){
        msg = util.format.apply(this, arguments);
    }
    
    console.log(msg);
};