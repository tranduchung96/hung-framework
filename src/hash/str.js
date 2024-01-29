import crypto from 'crypto';

/**
 * Create random string
 * @param length
 */
hung.randomstr = function (length = 16){
    return hung.hextoalpha(hung.randombytes(length)).substring(0, length);
}

/**
 * Create random bytes as hex
 * @return {string}
 */
hung.randombytes = function (length){
    return crypto.randomBytes(length).toString('hex');
}