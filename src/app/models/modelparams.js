/**
 * Media contents model (images, videos, etc)
 */
import mongoose, {Schema, types} from "mongoose";
const debug = hung.createDebug('models:imagecontents');

debug('Create image content model');

//Schema media contents
const ParamsdataSchema = new Schema({
    
    name: {
        type: String, index: true
    },
    
    groupname: {
        type: String, index: true
    },
    
    value: mongoose.Mixed,
    
    lastmodified: {
        type: Date, index: true
    },
    
    added: {
        type: Date, default: Date.now, index: true
    },
    
});

/**
 * DataParams model
 */
export default class DataParams extends mongoose.model('dataparamas', ParamsdataSchema){
    
    /**
     * Initialize
     * @type {boolean}
     */
    isInitialized = false;
    
    /**
     * Initialize
     * @return {Promise<void>}
     */
    async init(){
    
    }
    
    /**
     * Check params is exits or not
     * @param name
     * @param groupname
     */
    paramExists(name, groupname = null){
    
    }
    
    /**
     * get option with namespace
     * @param optionname
     * @param namespace
     */
    static getParam(optionname, defaults = null, groupname = null, single = false){
    
    }
    
    /**
     * Set param
     * @param optionname
     * @param optionvalue
     * @param defaults
     * @param groupname
     * @param single
     * @returns {Promise<DataParams>}
     */
    static setParam(optionname, optionvalue, defaults = null, groupname = null, single = false){
    
    }
    
    /**
     * Delete param
     * @param optionname
     * @param groupname
     */
    static deleteParam(optionname, groupname = null){
    
    }
    
}