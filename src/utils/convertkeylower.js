import lodash from 'lodash';

/**
 * Convert array to array of lower key
 * @param obj
 * @param dep
 * @return {*}
 */
function convert_key_to_lower(obj, dep = 0){
    
    if(!lodash.isObject(obj)){
        return obj;
    }
    
    Object.keys(obj).forEach(function (key){
        var k = key.toLowerCase();
        if(k !== key){
            var value = obj[key]
            obj[k] = value;
            delete obj[key];
            
            if(lodash.isObject(value)){
                convert_key_to_lower(value, dep++);
            }
            
            if(Array.isArray(value)){
                for(let v of value){
                    if(lodash.isObject(v)){
                        convert_key_to_lower(v, dep++);
                    }
                }
            }
        }
    });
    
    return obj;
}

export default convert_key_to_lower;