const Basemethods = {
    
    methods: {
        
        /**
         * Apply data to model if value is not null or undefined
         * @param data
         * @return {this}
         */
        applyIf(data){
            if(hung.isEmpty(data)){
                return this;
            }
            
            for(let key in data){
                let value = hung.value(data[key], this);
                if(value === null || value === undefined){
                    continue;
                }
                
                this[key] = data[key];
            }
            
            return this;
        },
        
        /**
         * Apply data to model
         * @param data
         * @return {this}
         */
        applyData(data){
            if(hung.isEmpty(data)){
                return this;
            }
            
            for(let key in data){
                this[key] = hung.value(data[key], this);
            }
            
            return this;
        }
    }
    
}

export default Basemethods;