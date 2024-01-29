hung.extends(hung.input = {}, {
    
    /**
     * get Input var
     * @param input
     */
    get(input){
        //is String
        if(!hung.isString(input)){
            return input;
        }
        
        //is Integer
        if(hung.str.isInt(input)){
            return parseInt(input);
        }
        
        //is Float
        if(hung.str.isFloat(input)){
            return parseFloat(input);
        }
        
        //is Boolean
        if(hung.str.isBoolean(input)){
            return !!input;
        }
        
        return input;
    },
    
    /**
     * Get json from input
     * @param input
     * @return {any|null}
     */
    getJson(input){
        try{
            return JSON.parse(input);
        }catch(e){
            return null;
        }
    }
    
});