import InvalidArgumentError from '../exceptions/InvalidArgumentError.js';

/**
 * Invalid argument error
 * @param message
 * @return {InvalidArgumentError}
 */
export function invalidArgument(message, data){
    let exception = new InvalidArgumentError(message);
    if(data){
        exception.data = data;
    }
    
    return exception;
}

/**
 * Is invaild argument error
 * @param error
 * @return {boolean}
 */
export default function isInvalidArgumentError(error){
    return error instanceof InvalidArgumentError;
}