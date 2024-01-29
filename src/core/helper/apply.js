/**
 * Apply data to context if has value
 * @param context
 * @param data
 * @return {Promise<*>}
 */
export default async function apply(context, data){
    if(hung.isEmpty(data)){
        return context;
    }
    
    for(let key in data){
        context[key] = await hung.value(data[key], context);
    }
    
    return context;
}