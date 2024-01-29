import crypto from 'crypto';
import zlib from 'zlib';
import buf from './buf.js';

let algorithm = 'aes-256-cfb';

/**
 * Encrypt
 * @param text
 * @param password
 * @param gzip
 * @return {String}
 */
hung.encrypt =  function (text, password = null, gzip = false){
    let pass = buf.secret;
    if(password){
        pass += password;
    }
    let cipher = crypto.createCipher(algorithm, pass);
    let crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    
    if(gzip){
        let ziped =  zlib.gzip(Buffer.from(crypted, 'base64'), {level: 9});
        return ziped.toString('base64');
    }
    return crypted;
};