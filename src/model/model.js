import mongoose from "mongoose";
import BaseMethods from "hung/model/base/basemethods.js";
const debug = hung.createDebug('hung:model');

/**
 * Create mongoose model
 * @param string collectionname
 * @param {mongoose.Schema} schema
 * @return {mongoose.Model}
 */
hung.model = function(collectionname, schema){
    debug('create model', collectionname);
    let modelcreate = mongoose.model(collectionname, schema);
    hung.extend(modelcreate, BaseMethods);
    return modelcreate;
}