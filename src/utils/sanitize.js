import validator from 'validator';
import lodash from "lodash";

//Extend sanitize
hung.extend(hung.sanitize = {}, {
    
    /**
     * Sanitize a string to slug
     * @param {string} str
     * @return {string}
     */
    title(str){
        return lodash.kebabCase(str);
    }
    
});