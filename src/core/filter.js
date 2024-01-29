import lodash from "lodash";

/**
 * Define a global object to stores registered filter hook
 */
let filterHooks = {};

/**
 * Define a global object to stores registered sort hook
 */
const filters = {
    
    /**
     * Register a filter hook
     * * @param hookName
     * @param callback
     * @param priority
     */
    add: (hookName, callback, priority = 10) => {
        if(!filterHooks[hookName]){
            filterHooks[hookName] = [];
        }
        
        filterHooks[hookName].push({callback, priority});
        filterHooks[hookName].sort((a, b) => a.priority - b.priority);
    },
    
    /**
     * Apply a filter hook
     * @param hookName
     * @param value
     * @param args
     * @returns {*}
     */
    apply: (hookName, value, ...args) => {
        let filteredValue = value;
        if(filterHooks[hookName]){
            filterHooks[hookName].forEach((item) => {
                filteredValue = item.callback(filteredValue, ...args);
            });
        }
        return filteredValue;
    },
    
    /**
     * Apply a filter hook asynchronously
     * @param hookName
     * @param value
     * @param args
     * @return {Promise<*>}
     */
    applyAsync: async(hookName, value, ...args) => {
        let filteredValue = value;
        if(filterHooks[hookName]){
            for(let item of filterHooks[hookName]){
                filteredValue = await item.callback(filteredValue, ...args);
            }
        }
        return filteredValue;
    },
    
    /**
     * Remove a registered filter hook
     * @param hookName
     * @param callback
     * @returns {boolean}
     */
    remove: (hookName, callback) => {
        if(filterHooks[hookName]){
            lodash.remove(filterHooks[hookName], (item) => {
                return item.callback === callback;
            });
            return true;
        }
        
        return false;
    },
    
    /**
     * Get a registered filter hook
     * @param hookName
     */
    get: (hookName) => {
        return filterHooks[hookName];
    },
    
    /**
     * Clear a filter hook
     */
    clear: (hookName) => {
        if(filterHooks[hookName]){
            delete filterHooks[hookName];
            filterHooks[hookName] = [];
        }
        return true;
    }
    
};

hung.filters = filters;