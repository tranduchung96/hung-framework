export default class Optionshandler{
    
    /**
     * Is initialized
     * @type {boolean}
     */
    isInitialized = false;
    
    /**
     * Option values
     * @type {Proxy}
     */
    values = null;
    
    constructor(){
        this.values = new Proxy(this, {
            
            set(target, p, newValue, receiver){
                target.set(p, newValue);
            },
            
            get(target, p, receiver){
                return target.get(p);
            },
            
            has(target, p){
                return target.has(p);
            },
            
            deleteProperty(target, p){
                target.delete(p);
            },
            
        });
    }
    
    /**
     * Is initialized
     * @type {boolean}
     */
    init(){
        if(this.isInitialized) return;
        this.isInitialized = true;
    }
    
    /**
     * Protect set value
     * @param value
     */
    set values(value){
        throw new Error('Optionshandler.values is read only');
    }
    
    /**
     * get Option value
     * @param option
     */
    get(option, defaults = null){
    
    }
    
    /**
     * has Option
     * @param option
     */
    has(option){
    
    }
    
    /**
     * set Option value
     * @param option
     * @param value
     */
    set(option, value){
    
    }
    
    /**
     * Delete option
     * @param option
     */
    delete(option){
    
    }
    
}