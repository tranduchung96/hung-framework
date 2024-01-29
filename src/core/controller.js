import lodash from "lodash";
import hung from "./core.js";
import fs from 'fs-extra';
import mimetypes from 'mime-types';
import {v4 as uuidv4} from 'uuid';

//List of content types
let contenttypes = new Map();
const maxAge = 60 * 60 * 24 * 365,
    lastModified = 60 * 60 * 24 * 30;

const debug = hung.createDebug('hung:controller');

/**
 * Base Controller
 * @type {BaseController}
 */
class BaseController{
    
    /**
     * Request
     * @type {express.Request}
     */
    req = null;
    
    /**
     * Response
     * @type {express.Response}
     */
    res = null;
    
    /**
     * Next
     */
    next = null;
    
    /**
     * Request arguments
     * @type {Proxy<string, *>}
     */
    args = null;
    
    /**
     * Constructor
     * @param req
     * @param res
     * @param next
     */
    constructor(req, res, next){
        this.req = req;
        this.res = res;
        this.next = next;
        
        // Fix Params
        this.req.params = this.req.params || {};
        
        // Proxy
        this.args = new Proxy({}, {
            get: (target, name) => {
                return this.getParam(name);
            },
            
            set: (target, name, value) => {
                return this.setParam(name, value);
            }
        });
    }
    
    /**
     * Dispatch request
     */
    async dispatch(action){
        try{
            debug('Dispatch request');
            if(hung.isFunction(action)){
                return await action.call(this);
            }
            
            let method = this[action + 'Action'];
            if(hung.isFunction(method)){
                return await method.call(this);
            }
            
            method = this[action];
            if(hung.isFunction(method)){
                return await method.call(this);
            }
            
            throw new Error('Action is not defined');
        }catch(e){
            hung.log_error(e);
        }finally{
            debug('Dispatch request complete');
            if(!this.res.headersSent){
                this.sendError('Request error', 500);
            }
        }
    }
    
    /**
     * Get request url
     * @returns {Uri}
     */
    get requesturi(){
        if(!this._requesturi){
            this._requesturi = this.req.uri;
        }
        
        return this._requesturi;
    }
    
    /**
     * Get
     * @param key
     * @return {string[]}
     */
    get(key, defaultValue = null){
        return this.getParam(key, defaultValue);
    }
    
    /**
     * Send status code
     * @param code
     * @returns {*}
     */
    status(code){
        return this.res.status(code);
    }
    
    /**
     * Send
     * @param data
     * @returns {*}
     */
    send(data){
        if(hung.isInteger(data)){
            return this.res.sendStatus(data);
        }
        
        return this.res.send(data);
    }
    
    /**
     * Send status code
     * @param code
     * @returns {*}
     */
    sendStatus(code){
        return this.res.sendStatus(code);
    }
    
    /**
     * Send file
     * @param view
     * @param data
     * @returns {*}
     */
    render(view, data){
        return this.res.render(view, data);
    }
    
    /**
     * Send Error Code 200
     */
    sendError(e, code = 200){
        if(typeof e === 'string'){
            return this.res.status(code).json({
                message: e,
                success: false,
                data: null
            });
        }else{
            let message = e;
            if(e && typeof e === 'object'){
                message = e.message || null;
            }
            
            return this.res.status(code).json({
                message: message,
                success: false,
                data: null
            });
        }
    }
    
    /**
     * Send Success Code 200
     */
    sendSuccess(data = null, message = null){
        let json = {
            success: true,
            data: data
        }
        if(message){
            json.message = message;
        }
        return this.res.status(200).json(json);
    }
    
    /**
     * Send Invalid Token Code 401
     */
    sendInvalidToken(){
        return this.res.status(498).json({
            statusCode: this.res.statusCode,
            message: 'Invalid Token',
            status: false,
            data: null,
        });
    }
    
    /**
     * Send json
     * @param data
     * @returns {*}
     */
    json(data){
        return this.res.json(data);
    }
    
    /**
     * Send json status
     * @param code
     * @param data
     * @returns {*}
     */
    jsonStatus(code, data){
        return this.res.status(code).json(data);
    }
    
    /**
     * Get action.js name
     * @returns {REPLCommandAction | MediaSessionAction | string}
     */
    getActionName(){
        return this.req.params.action;
    }
    
    /**
     * Get action.js
     * @returns {*}
     */
    getAction(){
        return this[this.getActionName()];
    }
    
    /**
     * get Param
     * @param key
     * @param defaultValue
     * @return {*|null}
     */
    getParam(key, defaultValue = null){
        if(this.req.params.hasOwnProperty(key)){
            return this.req.params[key];
        }
        
        if(this.req.body.hasOwnProperty(key)){
            return this.req.body[key];
        }
        
        if(this.req.query.hasOwnProperty(key)){
            return this.req.query[key];
        }
        
        return defaultValue;
    }
    
    /**
     * Set Param
     * @param key
     * @param value
     * @return {this}
     */
    setParam(key, value){
        this.req.params[key] = value;
        return this;
    }
    
    /**
     * Set header
     * @param headers
     * @return {this}
     */
    setHeader(key, value){
        this.res.set(key, value);
        return this;
    }
    
    /**
     * Set headers
     * @param headers
     * @return {this}
     */
    setHeaders(headers){
        hung.forIn(headers, (value, key) => {
            this.res.set(key, value);
        });
        
        return this;
    }
    
    /**
     * Set cookie
     * @param key
     * @param value
     * @return {this}
     */
    setCookie(key, value){
        this.res.cookie(key, value);
        return this;
    }
    
    /**
     * Set cookies
     * @param cookies
     * @return {this}
     */
    setCookies(cookies){
        hung.forIn(cookies, (value, key) => {
            this.res.cookie(key, value);
        });
        
        return this;
    }
    
    /**
     * Set content type
     * @param type
     * @return {this}
     */
    setContentType(type){
        let mimetype;
        
        if(contenttypes.has(type)){
            mimetype = contenttypes.get(type);
        }else{
            mimetype = mimetypes.lookup(type);
            if(type){
                contenttypes.set(type, mimetype);
            }
        }
        
        this.res.set('Content-Type', mimetype);
        
        return this;
    }
    
    /**
     * set Header caches
     * @param {{}|boolean} options
     */
    setHeaderCaches(options){
        options = options || {};
        
        //last modified
        if(!options.modified){
            options.modified = Date.now();
        }
        
        this.res.setHeaderCaches(options);
        
        return this;
    }
    
    /**
     * set Header last modified
     */
    setHeaderlastModified(modified){
        //set to auto last modified
        modified = modified === true ? false : modified;
        
        if(!modified){
            
            //get in last modified since
            let modify = this.req.headers['if-modified-since'];
            if(modify){
                this.res.set('Last-Modified', modify);
                return this;
            }
            
            //get in last modified
            modified = new Date(Date.now() - (lastModified * 1000)).toUTCString();
        }
        
        this.res.set('Last-Modified', modified);
        return this;
    }
    
    /**
     * Set header no cache
     * @return {BaseController}
     */
    setHeaderNoCache(){
        this.res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        this.res.set('Expires', '0');
        return this;
    }
    
    /**
     * Get header
     * @returns {MIMEParams | P | {[p: number]: boolean | number} | ((level: number, strategy: number, callback: () => void) => void) | T}
     */
    getParams(){
        return this.req.params;
    }
    
    /**
     * Get Authorization Token
     */
    getAuthorizationToken(){
        return this.getHeaders().authorization;
    }
    
    /**
     * Get Query
     * @returns {any}
     */
    getQuery(){
        return this.req.query;
    }
    
    /**
     * Get header
     * @param key
     * @returns {*}
     */
    getHeaders(){
        return this.req.headers;
    }
    
    /**
     * Get cookies
     * @returns {any}
     */
    getCookies(){
        return this.req.cookies;
    }
    
    /**
     * Get ip
     * @returns {string}
     */
    getIp(){
        return this.req.ip;
    }
    
    /**
     * Get Method
     * @returns {*}
     */
    getMethod(){
        return this.req.method;
    }
    
    /**
     * Get Protocol
     * @returns {*}
     */
    getProtocol(){
        return this.req.protocol;
    }
    
    /**
     * Get url
     * @returns {string}
     */
    getHost(){
        return this.req.hostname;
    }
    
    /**
     * Get url
     * @returns {string}
     */
    getOriginalUrl(){
        return this.req.originalUrl;
    }
    
    /**
     * Get url
     * @returns {string}
     */
    getBaseUrl(){
        return this.req.baseUrl;
    }
    
    /**
     * Get route
     * @returns {any}
     */
    getRoute(){
        return this.req.route;
    }
    
    /**
     * Get route path
     * @returns {*}
     */
    getRoutePath(){
        return this.req.route.path;
    }
    
    /**
     * Get route path
     * @returns {string}
     */
    getRouteStack(){
        return this.req.route.stack;
    }
    
    /**
     * Get route methods
     */
    getRouteMethods(){
        return this.req.route.methods;
    }
    
    /**
     * Get route regexp
     * @returns {string}
     */
    getRouteRegexp(){
        return this.req.route.regexp;
    }
    
    /**
     * Get route param
     * @returns {*}
     */
    getRouteParams(){
        return this.req.route.params;
    }
    
    /**
     * Get route param
     * @param param
     * @returns {*}
     */
    getRouteParam(param){
        return this.req.route.params[param];
    }
    
    /**
     * Get route param controller
     * @returns {ServiceWorker}
     */
    getRouteParamController(){
        return this.req.route.params.controller;
    }
    
    /**
     * Get route param module
     * @returns {*}
     */
    getRouteParamModule(){
        return this.req.route.params.module;
    }
    
    /**
     * Get route param id
     * @returns {*}
     */
    getRouteParamId(){
        return this.req.route.params.id;
    }
    
    /**
     * Check if request is ajax
     * @returns {boolean}
     */
    isAjax(){
        return this.req.xhr;
    }
    
    getFiles(key = null){
        if(this.req.files && Array.isArray(this.req.files)){
            let files = this.req.files.map((info) => {
                info.ext = info.originalname.split('.').pop();
                info.name = info.originalname.replace('.' + info.ext, '');
                info.toBase64 = () => `data:${info.mimetype};base64,${info.buffer.toString('base64')}`;
                info.save = (path = "", unique = false) => {
                    if(path !== "" && path !== "/"){
                        fs.ensureDirSync(path);
                        if(unique){
                            path = `${path}/${uuidv4()}-${info.originalname}`;
                        }else{
                            path = `${path}/${info.originalname}`;
                        }
                    }else{
                        if(unique){
                            path = `${uuidv4()}-${info.originalname}`;
                        }else{
                            path = `${info.originalname}`;
                        }
                    }
                    /**
                     * Tạo thư mục nếu chưa có theo bật đường dẫn
                     */
                    return new Promise((resolve, reject) => {
                        fs.writeFile(path, info.buffer, (err) => {
                            if(err) reject(err);
                            resolve(path);
                        });
                    });
                }
                return info;
            });
            if(key && Array.isArray(this.req.files)){
                return files.find((file) => file.fieldname === key) || null;
            }else{
                return files
            }
        }
        
        return null;
    }
    
}

//Base controller
hung.BaseController = BaseController;

/**
 * Create controller class
 * @param inherits
 */
hung.controller = function(...inherits){
    if(!inherits || !inherits.length){
        return BaseController;
    }
    
    return hung.extendClass(BaseController, ...inherits);
}

/**
 * Export
 */
export default BaseController;