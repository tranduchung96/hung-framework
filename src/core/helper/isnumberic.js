import vailidator from "validator";

/**
 * Check if value is numberic
 * @param value
 * @return {*|boolean}
 */
export default function isNumberic(value){
    let typeofvalue = typeof value;
    
    if(typeofvalue === 'number'){
        return true;
    }
    
    if(typeofvalue === 'string'){
        return vailidator.isNumeric(value);
    }
    
    return false;
}