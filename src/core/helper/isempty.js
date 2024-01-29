import lodash from 'lodash';

/**
 * Check if the value is an empty object
 * @param value
 * @return {boolean}
 */
export default function isempty(...value){
    if(value.length === 0){
        return true;
    }
    
    let result = true;
    for(const val of value){
        result = result && lodash.isEmpty(val);
    }
    
    return result;
}