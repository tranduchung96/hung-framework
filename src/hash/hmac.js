import {createHmac} from 'crypto';

/**
 * Calc hash with hmac algorithm
 * @param algorithm
 * @param data
 * @param secret
 */
function calculateHmac(algorithm = 'sha256', data, secret){
    const hash = createHmac(algorithm, secret);
    hash.update(data);
    return hash.digest('hex');
}

/**
 * verify Hmac
 * @param algorithm
 * @param hash
 * @param data
 * @param secret
 */
function verifyHash(algorithm, hash, data, secret){
    let cmp     = calculateHmac(algorithm, data, secret),
        cmpmd5  = hmacmd5(cmp, secret),
        hashmd5 = hmacmd5(hash, secret);
    return cmpmd5 === hashmd5;
}

hung.verifyHmac = verifyHash;

/**
 * Create hmac with data
 * @param data
 * @param secret
 * @returns {string}
 */
function hmac(data, secret){
    return calculateHmac('sha256', data, secret);
}

hung.hmac = hmac;
hung.hmac.sha256 = hmac;

/**
 * Verify hmac with sha256
 */
hung.hmac.verify = async function (hash, data, secret){
    return verifyHash('sha256', hash, data, secret);
};

/**
 * Create md5 hmac
 * @param data
 * @param secret
 * @return {string}
 */
function hmacmd5(data, secret){
    return calculateHmac('md5', data, secret);
}

hung.hmac.md5 = hmacmd5;