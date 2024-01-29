import crypto from 'crypto';
import lodash from 'lodash';
import buf from './buf.js';

/**
 * get Md5 of data
 * @type {hung.hash.md5}
 */
hung.sha1 = function sha1(data){
    if(!lodash.isString(data)){
        data = JSON.stringify(data);
    }
    const hmac = crypto.createHmac('sha1', buf.secret);
    return hmac.update(data, 'utf8').digest('hex');
};