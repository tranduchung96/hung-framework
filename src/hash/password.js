import Anybase from 'any-base';
import crypto from 'crypto';
import buf from './buf.js';

/**
 * get random password
 * @param length
 * @param symbol
 * @return {string}
 */
hung.randomPassword = function (length = 12, symbol = false){
    let passwordbase = buf.salt;
    if(symbol){
        passwordbase += buf.passwordcharacters;
    }
    //Ran str
    let ranstr  = crypto.randomBytes(length).toString('hex'),
        convert = Anybase(Anybase.HEX, passwordbase),
        data    = convert(ranstr);
    return data.substring(0, length);
}