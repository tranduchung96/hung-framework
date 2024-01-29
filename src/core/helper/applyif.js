/**
 * Apply data to context if value is not null or undefined
 * @param context
 * @param data
 * @return {Promise<*>}
 */
export default async function applyIf(context, data){
    if(hung.isEmpty(data)){
        return context;
    }
    
    for(let key in data){
        let value = await hung.value(data[key], context);
        if(value === null || value === undefined){
            continue;
        }
        
        context[key] = value;
    }
    
    return context;
}