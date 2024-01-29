hung.merge = hung.require('merge');

/**
 * Assign from source
 * @param target
 * @param sources
 */
Object.mergeIf = function (target, sources){
    target = target || {};
    
    if(arguments.length > 1){
        for(let i = 1; i < arguments.length; i++){
            let source = arguments[i];
            for(let prop in source){
                if(!target.hasOwnProperty(prop)){
                    target[prop] = source[prop];
                }
            }
        }
    }
    
    return target;
};

export default hung.merge;