import crypto from 'crypto';
import Anybase from 'any-base';
import buf from './buf.js';

/**
 * Generate secret string
 * @param length
 * @return {string}
 */
hung.generatesecretstr =  function (length = 64){
    let strdata = crypto.randomBytes(length).toString('hex'),
        convert = Anybase(Anybase.HEX, buf.salt + buf.characters),
        data    = convert(strdata);
    return data.substr(0, length);
}