import crypto from 'crypto';
import lodash from 'lodash';
import buf from './buf.js';

/**
 * get Md5 of data
 * @type string
 */
hung.md5 = function (data){
    if(!lodash.isString(data)){
        data = JSON.stringify(data);
    }
    const hmac = crypto.createHmac('md5', buf.secret);
    return hmac.update(data, 'utf8').digest('hex');
};