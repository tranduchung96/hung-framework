import fs from 'fs';
import {fileURLToPath} from "url";
import path from "path";

//Load cores
import hung from './core/hung.js';

//Current directory
const __dir__ = path.resolve(path.dirname(fileURLToPath(import.meta.url))),
    debug = hung.createDebug('hung:libs');

//Import libs
debug('Import libs');
for(let lib of [
    'datetime',
    'extendjs',
    'file',
    'hash',
    'express',
    'hash',
    'http',
    'threads',
    'mongoose',
    'model',
    'socket',
    'string',
    'uri',
    'utils',
    'database',
    'cache',
]){
    await hung.importPath(path.join(__dir__, lib));
}

debug('Import libs complete');

export default hung;