import Anybase from 'any-base';
import base64 from 'base-64';
import utf8 from 'utf8';

Anybase.ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
Anybase.ALPHABETNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Convert hex to alpha data
 * @param str
 * @return {string}
 */
function hextoalpha(str){
    const convert = Anybase(Anybase.HEX, Anybase.ALPHA);
    return str ? convert(str) : '';
}

hung.hextoalpha = hextoalpha;
/**
 * Convert string to alphabet
 * @param str
 * @return {string}
 */
function hextoalphabetnum(str){
    const convert = Anybase(Anybase.HEX, Anybase.ALPHABETNUM);
    return str ? convert(str) : '';
}

hung.hextoalphabetnum = hextoalphabetnum;

//Base64
hung.base64 = {
    /**
     * Encode data
     * @param data
     * @return {string}
     */
    encode(data){
        if(!data){
            return '';
        }
        
        return base64.encode(utf8.encode(data));
    },
    
    /**
     * Decode data
     * @param data
     * @return {*}
     */
    decode(data){
        if(!data){
            return null;
        }
        
        return utf8.decode(base64.decode(data));
    }
    
};