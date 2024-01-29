import buf from './buf.js';
const crypto    = hung.require('crypto');
const algorithm = 'aes-256-cfb';
const zlib      = hung.require('zlib');

/**
 * Decrypt
 * @param text
 * @param password
 * @param gzip
 * @return {String}
 */
hung.decrypt =  function (text, password = null, gzip = false){
    let pass = buf.secret;
    if(password){
        pass += password;
    }
    if(gzip){
        text = zlib.gunzipSync(Buffer.from(text, 'base64'));
    }
    let decipher = crypto.createDecipher(algorithm, pass);
    let dec = decipher.update(text, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};