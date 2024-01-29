/**
 * get value by fields
 * @param value
 * @param fields
 */
export default function valuesByFields(value, fields){
    
    //If value is not object
    if(typeof value !== 'object'){
        return value;
    }
    
    //If fields is empty
    if(hung.isEmpty(fields)){
        return {};
    }
    
    //If fields is object
    if(hung.isObject(fields)){
        let result = {};
        for(let field in fields){
            result[field] = value[field] ?? fields[field];
        }
        return result;
    }
    
    //If value is array
    if(hung.isArray(value)){
        let result = [];
        for(let item of value){
            result.push(valuesByFields(item, fields));
        }
        return result;
    }
    
    //If value is object
    let result = {};
    if(Array.isArray(fields)){
        for(let field of fields){
            result[field] = value[field] ?? null;
        }
    }
    return result;
    
}