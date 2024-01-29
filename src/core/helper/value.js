export default async function value(val, context){
    if(typeof val === 'function'){
        return hung.promise(async function(resolve, reject){
            try{
                let value = val.call(context || null);
                if(value instanceof Promise){
                    value = await value;
                }
                
                resolve(value);
            }catch(e){
                reject(e);
            }
        });
    }
    
    return val;
}