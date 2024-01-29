import lodash from "lodash";

hung.extend(hung, {
    
    /**
     * Gen random number
     * @param min
     * @param max
     * @return {number}
     */
    randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * parse Args to Object
     * @param args
     * @param defaults
     */
    parseArgs(args, defaults = {}){
        let obj = lodash.clone(args);
        lodash.forEach(defaults, (value, key) => {
            if(!obj.hasOwnProperty(key) || obj[key] == undefined){
                obj[key] = value;
            }
        });
        return obj;
    },
    
    /**
     * Set default values
     * @param target
     * @param args
     */
    defaults(target, ...args){
        return lodash.defaults(target, ...args);
    },
    
    /**
     * mergeObject
     * @param objects
     * @returns {{}}
     */
    mergeObject(...objects){
        return hung.extend({}, ...objects);
    },
    
    /**
     * mergeArrayMulti
     * @param arr1
     * @param arr2
     * @returns {*[]}
     */
    mergeArrayMulti(arr1, arr2){
        let arr = [];
        arr1.forEach((item1, index1) => {
            arr2.forEach((item2, index2) => {
                if(item1 == item2){
                    arr.push(item1);
                }
            });
        });
        return arr;
    },
    
    /**
     * concat Array
     * @param arr1
     * @param arr2
     * @returns {*[]}
     */
    concatArray(arr1, arr2){
        let arr = [];
        arr1.forEach((item1, index1) => {
            arr.push(item1);
        });
        arr2.forEach((item2, index2) => {
            arr.push(item2);
        });
        return arr;
    },
    
    /**
     * object To Array
     * @param obj
     * @returns {*[]}
     */
    objectToArray(obj){
        let arr = [];
        for(let key in obj){
            arr.push(obj[key]);
        }
        return arr;
    },
    
    /**
     * array To Object
     * @param arr
     * @returns {{}}
     */
    arrayToObject(arr){
        let obj = {};
        arr.forEach((item, index) => {
            obj[index] = item;
        });
        return obj;
    },
    
    /**
     * formatMoney
     * @param amount
     * @param decimalPrecision
     */
    formatMoney(amount, decimalPrecision = 2){
        // Convert the number to a string with the specified decimal precision
        const formattedAmount = amount.toFixed(decimalPrecision);
        // Split the string into an array of integer and fractional parts
        const [integerPart, fractionalPart] = formattedAmount.split('.');
        
        // Reverse the integer part of the array and split it into groups of 3 digits
        const reversedIntegerPart = integerPart.split('').reverse().join('');
        const integerGroups = reversedIntegerPart.match(/.{1,3}/g);
        
        // Join the integer groups with commas and reverse the string again
        const formattedIntegerPart = integerGroups.join(',').split('').reverse().join('');
        
        // Return the formatted money string with the specified decimal precision
        return `$${formattedIntegerPart}.${fractionalPart}`;
    },
    
    /**
     * get Base Remove type data application
     */
    getBase64String(base64){
        return base64.replace(/^data:application\/(.*);base64,/, '');
    }
    
});