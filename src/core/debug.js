import hung from './core.js';

import debug from "debug";

/**
 * Create debug function
 * @param namespace
 * @return {debug.Debugger | *}
 */
hung.createDebug = function(namespace){
    return debug(namespace);
}