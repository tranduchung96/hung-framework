/**
 * @namespace hung
 */

//Load libs
import lodash from 'lodash';
import {EventEmitter} from 'events';
import os from "os";
import {createRequire} from 'module';
import parallel from 'async/parallel.js';
import vailidator from 'validator';

//Set max events
EventEmitter.prototype.setMaxListeners(10000);

//Create global require
const require = createRequire(import.meta.url);
const debug = require('debug')('hung:core');

debug('Load hung core');
import hungObject from './helper/hungobject.js';

//Create global object
const hung = new hungObject();

//Create global event emitter
global.require = require;
global.hung = hung;
global.$ = hung;

/**
 * define namespace of objects and mixins for target object
 * @param target
 * @param {Object|Array} handler
 */
hung.define = function(target, handler){
    let object,
        targetisfunction = lodash.isFunction(target);
    
    if(!handler && lodash.isPlainObject(target)){
        handler = target;
        target = class{
        };
    }
    
    if(lodash.isString(target)){
        object = hung.define.namespace(target);
    }else{
        object = target;
    }
    
    if(lodash.isString(handler)){
        handler = require(handler);
    }
    
    for(let prop in handler){
        let ext = handler[prop];
        
        //Mixins
        if(prop === 'mixins' || prop === 'mixin' || prop === 'use'){
            hung.define(object, ext);
            continue;
        }
        
        //define sepecial attributes
        if(lodash.isPlainObject(ext)){
            
            //Properties
            if(prop === 'properties' || prop === 'props' || prop === 'data'){
                hung.define.defineProperty(object, ext);
                continue;
            }
            
            //statics
            if(prop === 'statics'){
                hung.extend(object, ext);
                continue;
            }
            
            //methods
            if(prop === 'methods'){
                hung.define.defineMethods(object, ext);
                continue;
            }
            
        }
        
        //Extend property or method
        if(targetisfunction){
            object.prototype[prop] = ext;
            continue;
        }
        
        object[prop] = ext;
    }
    
    return object;
};

/**
 * Define a namespace
 * @param target
 */
hung.define.namespace = function(target){
    if(!lodash.isString(target)){
        return false;
    }
    
    let ns   = target.split('.'),
        root = ns[0],
        object;
    
    if(!global[root]){
        global[root] = {};
    }
    
    object = global[root];
    
    if(ns.length > 1){
        for(let i = 1; i < ns.length - 1; i++){
            let name = ns[i];
            object = object[name] = object[name] || {};
        }
    }
    
    object = object[ns[ns.length - 1]] = object[ns[ns.length - 1]] || {};
    return object;
};

/**
 * Define a get Property
 * @param obj
 * @param properties
 * @param define
 */
hung.define.getProperty = function(obj, properties, define){
    
    if(lodash.isString(properties) && lodash.isFunction(define)){
        defineGetter(obj, properties, define);
        return;
    }
    
    for(let prop in properties){
        let sprop = properties[prop];
        if(lodash.isFunction(sprop)){
            defineGetter(obj, prop, sprop);
        }else{
            obj[prop] = sprop;
        }
    }
    
};

/**
 * Define a get Property
 * @param obj
 * @param properties
 * @param define
 */
hung.define.setProperty = function(obj, properties, define){
    if(lodash.isString(properties) && lodash.isFunction(define)){
        defineSetter(obj, properties, define);
        return;
    }
    
    for(let prop in properties){
        let sprop = properties[prop];
        if(lodash.isFunction(sprop)){
            defineSetter(obj, prop, sprop);
        }else{
            obj[prop] = sprop;
        }
    }
};

/**
 * define a property
 */
hung.define.defineProperty = function(obj, properties, define){
    let objectisfunction = lodash.isFunction(obj),
        objectisclass    = hung.isClassObject(obj);
    
    let isdefineproperty = obj.prototype && (objectisfunction || objectisclass);
    
    if(lodash.isString(properties) && lodash.isFunction(define)){
        defineGetter(isdefineproperty ? obj.prototype : obj, properties, define);
        return;
    }
    
    if(lodash.isObject(properties)){
        for(let prop in properties){
            let sprop = properties[prop];
            
            if(lodash.isFunction(sprop)){
                defineGetter(isdefineproperty ? obj.prototype : obj, prop, sprop);
                continue;
            }
            
            if(hung.isObject(sprop)){
                
                let isset = sprop.set && hung.isFunction(sprop.set),
                    isget = sprop.get && hung.isFunction(sprop.get);
                
                if(isset && isget){
                    defineGetterAndSetter(isdefineproperty ? obj.prototype : obj, prop, sprop);
                    continue;
                }
                
                //define setter
                if(isset){
                    defineSetter(isdefineproperty ? obj.prototype : obj, prop, sprop.set);
                    continue;
                }
                
                //define getter
                if(sprop.get && hung.isFunction(sprop.get)){
                    defineGetter(isdefineproperty ? obj.prototype : obj, prop, sprop.get);
                    continue;
                }
                
            }
            
            if(isdefineproperty){
                obj.prototype[prop] = sprop;
            }else{
                obj[prop] = sprop;
            }
            
        }
    }
};

/**
 * Define a get Property
 * @param obj
 * @param methods
 * @param define
 */
hung.define.defineMethods = function(obj, methods, define){
    let objectisfunction = lodash.isFunction(obj),
        objectisclass    = hung.isClassObject(obj);
    
    if(lodash.isString(methods) && lodash.isFunction(define)){
        if(objectisfunction && obj.prototype){
            obj.prototype[methods] = define;
        }else{
            obj[methods] = define;
        }
        
        return;
    }
    
    for(let name in methods){
        let method = methods[name];
        if((objectisfunction || objectisclass) && obj.prototype){
            obj.prototype[name] = method;
        }else{
            obj[name] = method;
        }
    }
    
};

/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} define
 * @admin
 */
function defineProperty(obj, name, define){
    Object.defineProperty(obj, name, {
        enumerable: true,
        configurable: true,
        value: define,
        writable: true
    });
}

/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} getter
 * @admin
 */
function defineGetter(obj, name, getter){
    Object.defineProperty(obj, name, {
        get: getter
    });
}

/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param setter
 * @admin
 */
function defineSetter(obj, name, setter){
    Object.defineProperty(obj, name, {
        set: setter
    });
}

/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} getter
 * @admin
 */
function defineGetterAndSetter(obj, name, define){
    Object.defineProperty(obj, name, {
        get: define.get,
        set: define.set,
        enumerable: true,
        configurable: true,
    });
}

/**
 * Alias extend function
 */
hung.extend = require("extend");

/**
 * Inherits a methods to class
 * @param target
 * @param {Object|Array} mixins
 * @return {*}
 * @constructor
 */
hung.extends = hung.mixins = function(target, ...mixins){
    if(lodash.isString(target)){
        target = hung.define.namespace(target);
    }
    
    if(hung.isObject(target) && !mixins.length){
        mixins = [target];
        target = class{
        };
    }
    
    if(mixins.length){
        lodash.each(mixins, (mixin) => {
            hung.define(target, mixin);
        });
    }
    
    return target;
};

/**
 * Extends a class
 * @param baseClass
 * @param mixins
 */
hung.extendClass = function(baseClass, ...mixins){
    let target = class classname extends baseClass{
    };
    
    return hung.extends(target, ...mixins);
};

/**
 * Noop
 */
hung.noop = function noop(){
};

//Alias of lodash
hung.require = require;
hung.isFunction = lodash.isFunction;
hung.isString = lodash.isString;
hung.isObject = lodash.isObject;
hung.isPlainObject = lodash.isPlainObject;
hung.isNumber = lodash.isNumber;
hung.isInteger = lodash.isInteger;
hung.isBoolean = lodash.isBoolean;
hung.isArray = lodash.isArray;
hung.isArrayBuffer = lodash.isArrayBuffer;
hung.isDate = lodash.isDate;
hung.isRegExp = lodash.isRegExp;
hung.isError = lodash.isError;
hung.isSymbol = lodash.isSymbol;
hung.isMap = lodash.isMap;
hung.isWeakMap = lodash.isWeakMap;
hung.isSet = lodash.isSet;
hung.isWeakSet = lodash.isWeakSet;
hung.isEqual = lodash.isEqual;
hung.isEqualWith = lodash.isEqualWith;
hung.isMatch = lodash.isMatch;
hung.isMatchWith = lodash.isMatchWith;
hung.isEmpty = lodash.isEmpty;
hung.isFinite = lodash.isFinite;
hung.isNaN = lodash.isNaN;
hung.isNil = lodash.isNil;
hung.isNull = lodash.isNull;
hung.isUndefined = lodash.isUndefined;
hung.isBuffer = lodash.isBuffer;
hung.isArguments = lodash.isArguments;
hung.isAlpha = vailidator.isAlpha;
hung.isAlphanumeric = vailidator.isAlphanumeric;
hung.isAscii = vailidator.isAscii;

//is empty object
import isempty from "./helper/isempty.js";
hung.isEmpty = isempty;

//is promise
import isPromise from "./helper/ispromise.js";
hung.isPromise = isPromise;

//is Numberic
import isnumberic from "./helper/isnumberic.js";
hung.isNumerric = isnumberic;
hung.isUrl = vailidator.isURL;
hung.isEmail = vailidator.isEmail;

//Modify variables functions
hung.clone = lodash.clone;
hung.cloneDeep = lodash.cloneDeep;
hung.get = lodash.get;
hung.has = lodash.has;

//Loop functions
hung.forEach = lodash.forEach;
hung.forIn = lodash.forIn;
hung.each = lodash.each;
hung.map = lodash.map;

//convert variables
hung.toArray = lodash.toArray;
hung.toInteger = lodash.toInteger;
hung.toNumber = lodash.toNumber;
hung.toFinite = lodash.toFinite;
hung.toPlainObject = lodash.toPlainObject;
hung.toFloat = lodash.toFloat;

//Values functions
hung.unset = lodash.unset;
hung.values = lodash.values;
hung.defaults = lodash.defaults;

//Value by fields
import valuesbyfields from './helper/valuefields.js';
hung.valuesByFields = valuesbyfields;

//Apply data
import apply from './helper/apply.js';
import applyif from './helper/applyif.js';
hung.apply = apply;
hung.applyIf = applyif;

//value
import value from './helper/value.js';
hung.value = value;

//is Async Function
import isasyncfunction from './helper/isasyncfunction.js';
hung.isAsyncFunction = isasyncfunction;

//wrap callback
import callcallback from './helper/callcallback.js';
hung.callback = callcallback;

//Invaild exception error
import isInvalidArgumentError, {invalidArgument} from './helper/isinvaildargumenterror.js';
hung.isInvalidArgumentError = isInvalidArgumentError;
hung.invalidArgument = invalidArgument;

//String functions
hung.escape = lodash.escape;
hung.unescape = lodash.unescape;
hung.trim = lodash.trim;
hung.ltrim = lodash.trimEnd;
hung.rtrim = lodash.trimStart;
hung.truncate = lodash.truncate;

/**
 * is Class Object
 * @param object
 * @return {boolean}
 */
hung.isClassObject = function(object){
    return object && object.constructor && object.constructor.name
        && object.constructor.name !== 'Function'
        && object.constructor.name !== 'AsyncFunction'
        && object.constructor.name !== 'GeneratorFunction'
        && object.constructor.name !== 'Object';
}

/**
 * get callback context
 * @param callback
 */
hung.getContextCallback = function(callback, defaultcontext = null){
    if(lodash.isFunction(callback)){
        return {context: callback.context || callback.ctx || callback.this || defaultcontext, callback: callback};
    }
    
    if(hung.isArray(callback) && callback.length == 2 && lodash.isObject(callback[0])){
        if(hung.isFunction(callback[1])){
            return {context: callback[0], callback: callback[1]};
        }
        
        if(hung.isString(callback[1]) && hung.isFunction(callback[0][callback[1]])){
            return {context: callback[0], callback: callback[0][callback[1]]};
        }
        
        return {context: callback[0], callback: callback[1]};
    }
    
    return {context: defaultcontext, callback: callback};
}

export default hung;