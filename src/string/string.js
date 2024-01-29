import lodash from 'lodash';
import fs from "fs";
let stopwords;
const quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
import vailidator from "validator";

//Create vailidator for str
hung.str = vailidator;

hung.extends(hung.str, {
    
    /**
     * Check str have contains word
     * @param str
     * @param words
     */
    contains(str, words){
        if(!Array.isArray(words)){
            words = lodash.words(words);
        }
        
        for(let word of words){
            if(str.indexOf(word) >= 0){
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Check str contain all words
     * @param str
     * @param words
     **/
    containAll(str, words){
        if(!Array.isArray(words)){
            words = lodash.words(words);
        }
        
        for(let word of words){
            if(str.indexOf(word) == -1){
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Convert string to slug
     * @param text
     * @return {string}
     */
    slugify(text){
        text = lodash.trim(text);
        return text.toLowerCase()
            /**
             * replace & to empty
             */
            .replace(/&/g, '')
            
            .replace(/\+\(/g, "''")
            
            .replace(/_/g, " ")
            .replace(/\+/g, '')
            .replace(/[^\w\-]+/g, ' ')
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    },
    
    /**
     * Convert string to title
     * @param text
     * @return {string}
     */
    slugUT8(str){
        // Chuyển hết sang chữ thường
        str = str.toLowerCase();
        // xóa dấu
        str = str
            .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
            .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp
        
        // Thay ký tự đĐ
        str = str.replace(/[đĐ]/g, 'd');
        
        // Xóa ký tự đặc biệt
        str = str.replace(/([^0-9a-z-\s])/g, '');
        
        // Remove spaces and replace them with -
        str = str.replace(/(\s+)/g, '-');
        
        // Delete characters - consecutive
        str = str.replace(/-+/g, '-');
        
        // remove residuals - at the beginning & end
        str = str.replace(/^-+|-+$/g, '');
        // return
        return str;
    },
    
    /**
     * get Data Attribute Object
     * @param obj
     * @return {String}
     */
    getDataAttribute(obj){
        let keys = Object.keys(obj);
        if(keys.length){
            let returns = [];
            keys.forEach(name => {
                returns.push('name="' + lodash.escape(obj[name]) + '"');
            });
            
            return returns.join(' ');
        }
        
        return '';
    },
    
    /**
     * Check string is Html or not
     * @param str
     * @return {boolean}
     */
    isHtml(str){
        // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
        if(str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;
        
        // Run the regex
        let match = quickExpr.exec(str);
        return !!(match && match[1]);
    },
    
    /**
     * Convert first charracter to uper case
     * @param s
     * @return {String}
     */
    ucfirst(s){
        return s.charAt(0).toUpperCase() + s.substr(1);
    },
    
    /**
     * get List stop words
     * @return {Array}
     */
    getListstopWords(){
        if(!stopwords){
            stopwords = [];
            fs.readFileSync(__etcdir + '/src/stopwords.txt', 'utf8').split("\n").forEach(word => {
                word = lodash.trim(word);
                if(word.length){
                    stopwords.push(word);
                }
            });
        }
        
        return stopwords;
    },
    
    /**
     * Trim at the end words
     * @param {Array|String} words
     * @return {String}
     */
    trimendword(words){
        let hasword;
        let stopwords = this.getListstopWords();
        if(lodash.isString(words)){
            words = lodash.words(words);
        }
        
        for(let j = words.length - 1; j >= 0; j--){
            if(~stopwords.indexOf(words[j])){
                delete words[j];
                continue;
            }
            
            return words.join(' ');
        }
        return words.join(' ');
    },
    
    /**
     * get a keyword from string
     * @param string
     * @param length
     * @param maxwords
     * @return {String}
     */
    getKeyword(string, length = 25, maxwords = 4){
        string = lodash.truncate(string, {
            length: length || 25,
            separator: ' ',
            omission: ''
        });
        string = lodash.words(string);
        if(string.length > maxwords){
            string = string.slice(0, maxwords);
        }
        return this.trimendword(string);
    },
    
    /**
     * random string
     * @param length
     * @returns {string}
     */
    randomString(length = 10){
        return Math.random().toString(36).substr(2, length);
    },
    
    /**
     * Convert array to string
     * @param array
     * @type  str
     * @returns {*}
     */
    arrayToStr(array, type = ','){
        return array.join(',');
    },
    
    /**
     * Convert string to array
     * @param str
     * @type  str
     * @returns {Array}
     */
    strToArr(str, type = ','){
        return str.split(type);
    },
    
    /**
     * Include
     * @param str
     * @param search
     * @returns {boolean}
     */
    include(str, search){
        return str.indexOf(search) >= 0;
    },
    
    /**
     * Start with
     * @param str
     * @param search
     * @returns {boolean}
     */
    startWith(str, search){
        return str.indexOf(search) == 0;
    },
    
    /**
     * End with
     * @param str
     * @param search
     * @returns {boolean}
     */
    endWith(str, search){
        return str.indexOf(search) == str.length - search.length;
    },
    
    /**
     * Convert string to number
     */
    toNumber(str){
        return Number(str);
    }
    
});

export default hung.str;