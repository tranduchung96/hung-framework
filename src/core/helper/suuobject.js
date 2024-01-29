//Load libs
import {createRequire} from 'module';
import Eventobject from "./eventobject.js";

/**
 * hungObject
 */
class hungObject extends Eventobject{
    
    /**
     * Create require
     * @param url
     * @return {function(*): *}
     */
    createRequire(url){
        return createRequire(url);
    }
    
}

export default hungObject;