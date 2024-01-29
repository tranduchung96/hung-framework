/**
 * Media contents model (images, videos, etc)
 */
import mongoose, {Schema, types} from "mongoose";
const debug = hung.createDebug('models:imagecontents');

debug('Create image content model');

//Schema media contents
const OptionsSchema = new Schema({
    
    optionname: {
        type: String, index: true
    },
    
    groupname: {
        type: String, index: true
    },
    
    optionvalue: mongoose.Mixed,
    
    lastmodified: {
        type: Date, index: true
    },
    
    added: {
        type: Date, default: Date.now, index: true
    },
    
    autoload: {
        type: Boolean, default: false, index: true
    }
    
});

/**
 * DataParams model
 */
export default class OptionModel extends mongoose.model('options', OptionsSchema){
    
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
     * has option with namespace
     * @param optionname
     * @param groupname
     */
    static optionExists(optionname, groupname = null){
    
    }
    
    /**
     * get option with namespace
     * @param optionname
     * @param namespace
     */
    static async getOption(optionname, defaults = null, groupname = null, single = false){
    
    }
    
    /**
     * Set param
     * @param optionname
     * @param optionvalue
     * @param defaults
     * @param groupname
     * @param single
     * @returns {Promise<OptionModel>}
     */
    static async updateOption(optionname, optionvalue, defaults = null, groupname = null, single = false){
    
    }
    
    /**
     * Delete param
     * @param optionname
     * @param groupname
     */
    static async deleteOption(optionname, groupname = null){
    
    }
    
    /**
     * Get autoload options
     */
    static async getAutoloadOptions(){
    
    }
    
}