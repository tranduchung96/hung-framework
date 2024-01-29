import express from 'express';
import mimetypes from "mime-types";
const debug = hung.createDebug('hung:express:response');

//List of content types
let contenttypes = new Map();
const maxAge       = 60 * 60 * 24 * 365,
      lastModified = 60 * 60 * 24 * 30;

hung.extends(express.response, {
    
    /**
     * Send a static file from server
     * @param filepath
     * @param options
     */
    async sendStaticFile(filepath, options = {}){
        if(!filepath){
            return this.request_error();
        }
        
        let exits = options.exits || null;
        if(exits === null){
            exits = await hung.fs.pathExists(filepath);
        }
        
        if(!exits){
            return this.request_error();
        }
        
        //get file stats
        let fstats = await hung.fs.stat(filepath);
        
        //get last modified in timestamp
        let lastModified = (new Date(fstats.mtime)).getTime();
        let age = maxAge * 20;
        
        //set headers
        this.setHeaderCaches({
            modified: lastModified,
            expires: lastModified + age * 1000,
            age: age
        });
        
        this.sendFile(filepath, options);
    },
    
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
        
        this.set('Content-Type', mimetype);
        
        return this;
    },
    
    /**
     * set Header caches
     * @param {{}|boolean} options
     */
    setHeaderCaches(options){
        if(!options){
            return this.setHeaderNoCache();
        }
        options = options || {};
        
        let lastmodified = options.modified || Date.now();
        let age = options.age || maxAge;
        let expires = options.expires || new Date(lastmodified + age * 1000);
        let cachecontrol = options.cachecontrol || 'public, max-age=' + age;
        this.setLastModified(new Date(lastmodified));
        this.setExpires(hung.isDate(expires) ? expires : new Date(expires));
        this.set('Cache-Control', cachecontrol);
        
        return this;
    },
    
    /**
     * Set header cache control
     * @param options
     */
    setCacheControl(options = true, age = null){
        if(!options){
            return this.setHeaderNoCache();
        }
        
        age = age || maxAge;
        if(hung.isString(options) && !age){
            this.set('Cache-Control', options);
            return this;
        }
        
        //Public
        if(options === true || options.public){
            this.set('Cache-Control', 'public, max-age=' + age);
            this.set('Expires', new Date(Date.now() + (age * 1000)).toUTCString());
            return this;
        }
        
        //Private
        if(options.private){
            this.set('Cache-Control', 'private, max-age=' + age);
            return this;
        }
        
        if(options.mustRevalidate){
            this.set('Cache-Control', 'must-revalidate');
            return this;
        }
        
        //No cache
        if(options.nocache){
            this.setHeaderNoCache();
            return this;
        }
        
    },
    
    /**
     * Set header age
     * @param age
     * @return {e.response}
     */
    setAge(age){
        if(!age){
            age = maxAge;
        }
        
        age = parseInt(age);
        age = new Date(Date.now() + (age * 1000)).toUTCString();
        
        this.set('Age', age);
        return this;
    },
    
    /**
     * Set header expires
     * @param expires
     */
    setExpires(expires){
        if(expires === 0){
            this.set('Expires', 0);
            return this;
        }
        
        if(!expires){
            expires = maxAge;
        }
        
        //is Date
        if(hung.isDate(expires)){
            this.set('Expires', expires.toUTCString());
            return this;
        }
        
        expires = parseInt(expires);
        expires = new Date(Date.now() + (expires * 1000)).toUTCString();
        
        this.set('Expires', expires);
        return this;
    },
    
    /**
     * set Header last modified
     */
    setLastModified(modified){
        //set to auto last modified
        modified = modified === true ? false : modified;
        
        if(hung.isDate(modified)){
            this.set('Last-Modified', modified.toUTCString());
            return this;
        }
        
        if(!modified){
            
            //get in last modified since
            let modify = this.headers['if-modified-since'];
            if(modify){
                this.set('Last-Modified', modify);
                return this;
            }
            
            //set last modified from now
            if(hung.isNumber(modified)){
                modified = parseInt(modified);
                if(modified < 0){
                    modified = new Date(Date.now() + (lastModified * 1000)).toUTCString();
                }else{
                    modified = new Date(modified).toUTCString();
                }
            }
        }
        
        this.set('Last-Modified', modified.toString());
        return this;
    },
    
    /**
     * Set header no cache
     * @return {BaseController}
     */
    setHeaderNoCache(){
        this.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        this.set('Expires', new Date( Date.now() - (maxAge * 1000)).toUTCString());
        return this;
    },
    
    /**
     * Response success data
     */
    success(data){
        return this.json({
            success: true,
            data: data
        });
    },
    
    /**
     * Error errors
     */
    errors(msg){
        let data = {
            success: false
        };
        
        if(msg){
            data.error = msg;
        }
        
        return this.json(data);
    },
    
    /**
     * get/set view var
     */
    viewVar: function(name, value = null){
        
        if(null === value){
            return this.locals.hasOwnProperty(name) ? this.locals[name] : null;
        }
        
        if(Array.isArray(name)){
            return name.forEach((v, n) => {
                this.locals[n] = v;
            });
        }
        
        this.locals[name] = value;
        return this;
    }
    
});