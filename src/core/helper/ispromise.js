import isPromise from 'is-promise';

/**
 * Check if value is a promise
 * @param obj
 */
export default function(obj){
    if(!obj){
        return false;
    }
    
    if((obj instanceof Promise) || (typeof obj.then === 'function')){
        return true;
    }
    
    return isPromise(obj);
};