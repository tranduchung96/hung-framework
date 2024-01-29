import express from 'express';
import lodash from "lodash";
import mimetypes from "mime-types";

//Load useragent
import useragent from 'useragent';
import './request/useragent.js';
import Uri from "../uri/uri.js";

const debug = hung.createDebug('hung:express:request');



hung.extends(express.request, {
    
    properties: {
        
        /**
         * get Current Uri
         * @return {Uri}
         */
        uri: function(){
            if(!this._uri){
                this._uri = new Uri(this.protocol + '://' + this.hostname + this.originalUrl);
            }
            
            return this._uri;
        },
        
        /**
         * get Current Url
         * @return {string}
         */
        requesturl: function(){
            if(!this._requesturl){
                this._requesturl = this.protocol + '://' + this.hostname + this.originalUrl;
            }
            
            return this._requesturl;
        },
        
        /**
         * get Url id
         * @return {string}
         */
        urlid: function(){
            if(this._urlid === undefined){
                this._urlid = hung.md5(this.protocol + this.hostname + this.originalUrl);
            }
            
            return this._urlid;
        },
        
        /**
         * get query id
         * @return {string}
         */
        queryid: function(){
            if(!this._queryid){
                this._queryid = this.originalUrl;
                
                if(!hung.isEmpty(this.body)){
                    this._queryid += JSON.stringify(this.body);
                }
                
                this._queryid = hung.md5(this._queryid);
            }
            
            return this._queryid;
        },
        
        /**
         * get request id. include request post body
         * @return {string}
         */
        requestid: function(){
            if(!this._requestid){
                let requests = this.protocol + this.hostname + this.originalUrl;
                if(!hung.isEmpty(this.body)){
                    requests += JSON.stringify(this.body);
                }
                
                this._requestid = hung.md5(requests);
            }
            
            return this._requestid;
        },
        
        /**
         * is Ajax
         * @return {boolean}
         */
        isAjax: function(){
            if(this._isajax === undefined){
                let isajax = this.xhr;
                if(!isajax && this.query.xhr){
                    isajax = parseInt(this.query.xhr) === 1;
                }
                
                this._isajax = isajax;
            }
            
            return this._isajax;
        },
        
        /**
         * is get method
         */
        isGet: function(){
            if(this._isGet !== undefined){
                return this._isGet;
            }
            
            this._isGet = lodash.toLower(this.method) === 'get';
            return this._isGet;
        },
        
        /**
         * is Post method
         * @return {boolean}
         */
        isPost: function(){
            if(this._isPost !== undefined){
                return this._isPost;
            }
            
            this._isPost = lodash.toLower(this.method) === 'post';
            return this._isPost;
        },
        
        /**
         * @return {string}
         */
        domainname: function(){
            if(!this._domainname){
                let domainname = this.hostname;
                if(domainname.startsWith('www.')){
                    domainname = domainname.slice(4);
                }
                
                this._domainname = domainname;
            }
            
            return this._domainname;
        },
        
        /**
         * get user agent
         */
        useragent: function(){
            if(!this._useragent){
                this._useragent = useragent.lookup(this.headers['user-agent']);
            }
            return this._useragent;
        }
        
    },
    
    methods: {
        
        /**
         * get Request params
         * @param name
         * @param defaultvalue
         * @return {null|*|string}
         */
        getParam(name, defaultvalue = null){
            
            if(this.body && this.body[name] !== undefined && this.body[name] !== null){
                return this.body[name];
            }
            
            if(this.query && this.query[name] !== undefined && this.query[name] !== null){
                return this.query[name];
            }
            
            if(this.params && this.params[name] !== undefined && this.params[name] !== null){
                return this.params[name];
            }
            
            return defaultvalue;
        },
        
        /**
         * Dispatch request
         * @param {BaseController} controller
         */
        async dispatch(controller, action = null){
            if(!controller || !controller.dispatch || !lodash.isFunction(controller.dispatch)){
                this.request_error();
                throw new Error('Controller is not defined');
            }
            
            try{
                debug('Dispatch request');
                this.controller = controller
                await controller.dispatch(action);
            }catch(e){
                hung.log_error(e);
            }finally{
                debug('Dispatch load media request complete');
                
                if(!controller.res.headersSent){
                    controller.res.status(500);
                    controller.res.send('Internal server error');
                }
            }
        }
        
    },
    
});