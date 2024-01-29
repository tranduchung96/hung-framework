import statuscode from "./statuscode.js";

class Httpstatus{
    
    /**
     * Status code
     * @type {number}
     */
    status = 0;
    
    /**
     * Constructor
     * @param status
     */
    constructor(status){
        this.status = status;
    }
    
    /**
     * Is ok
     * @return {boolean}
     */
    get isOk(){
        return this.status >= statuscode.OK && this.status < statuscode.MULTIPLE_CHOICES;
    }
    
    /**
     * Is redirect
     * @return {boolean}
     */
    get isRedirect(){
        return this.status >= statuscode.MOVED_PERMANENTLY && this.status < statuscode.TEMPORARY_REDIRECT;
    }
    
    /**
     * Is client error
     * @return {boolean}
     */
    get isClientError(){
        return this.status >= 400 && this.status < 500;
    }
    
    /**
     * Is server error
     * @return {boolean}
     */
    get isServerError(){
        return this.status >= 500 && this.status < 600;
    }
    
    /**
     * Is not found
     * @return {boolean}
     */
    get isNotFound(){
        return this.status === 404;
    }
    
    /**
     * Is unauthorized
     * @return {boolean}
     */
    get isUnauthorized(){
        return this.status === 401;
    }
    
    /**
     * Is forbidden
     * @return {boolean}
     */
    get isForbidden(){
        return this.status === 403;
    }
    
    /**
     * Is successful
     * @return {boolean}
     */
    get isSuccessful(){
        return this.isOk();
    }
    
    /**
     * Is client error
     * @return {boolean}
     */
    get isInvalidArgument(){
        return this.status === 422;
    }
    
    /**
     * Is timeout
     * @return {boolean}
     */
    get isTimeout(){
        return this.status === 408;
    }
    
    /**
     * Is conflict
     * @return {boolean}
     */
    get isConflict(){
        return this.status === 409;
    }
    
    /**
     * Is unprocessable entity
     * @return {boolean}
     */
    get isUnprocessableEntity(){
        return this.status === 422;
    }
    
    /**
     * Is too many requests
     * @return {boolean}
     */
    get isTooManyRequests(){
        return this.status === 429;
    }
    
    /**
     * Is internal server error
     * @return {boolean}
     */
    get isInternalServerError(){
        return this.status === 500;
    }
    
    /**
     * Is bad gateway
     * @return {boolean}
     */
    get isBadGateway(){
        return this.status === 502;
    }
    
    /**
     * Is service unavailable
     * @return {boolean}
     */
    get isServiceUnavailable(){
        return this.status === 503;
    }
    
    /**
     * Is gateway timeout
     * @return {boolean}
     */
    get isGatewayTimeout(){
        return this.status === 504;
    }
    
    /**
     * Is HTTP version not supported
     * @return {boolean}
     */
    get isNetworkError(){
        return this.status === 0;
    }
    
    /**
     * Is cancelled
     * @return {boolean}
     */
    get isCancelled(){
        return this.status === -1;
    }
    
    /**
     * Is unknown
     * @return {boolean}
     */
    get isInvalidToken(){
        return this.status === 498;
    }
    
    /**
     * Is token required
     * @return {boolean}
     */
    get isTokenRequired(){
        return this.status === 499;
    }
    
    /**
     * Is invalid response
     * @return {boolean}
     */
    get isInvalidResponse(){
        return this.status === 500;
    }
    
    /**
     * Is invalid request
     * @return {boolean}
     */
    get isInvalidRequest(){
        return this.status === 400;
    }
    
}

export default Httpstatus;