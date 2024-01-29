/**
 * get Properties of object
 */
Object.getOwnPropertiesObject = function(object){
    let keys = Object.keys(object), obj = {};
    if(keys.length){
        keys.forEach(name => {
            obj[name] = object[name];
        });
    }
    
    return obj;
};