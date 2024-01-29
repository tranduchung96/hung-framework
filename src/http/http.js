import createAxiosHttp from './helper/axios.client.js';
import Httpstatus from './helper/httpstatus.js';

const debug = hung.createDebug('hung:http');

class Http{
    
    isInit = false;
    
    /**
     * Http client
     * @type {axios.AxiosInstance}
     */
    client = null;
    
    /**
     * Initialize http client
     */
    async init(){
        if(this.isInit){
            return;
        }
        this.client = createAxiosHttp();
        this.isInit = true;
    }
    
    /**
     * Get raw response
     * @param url
     * @return {Promise<axios.AxiosResponse<any>>}
     */
    async getRaw(url){
        if(!this.isInit){
            await this.init();
        }
        
        try{
            if(debug.enabled) debug("get raw response", {url: url});
            
            return await this.client.get(url, configs || {});
        }catch(e){
            if(e.response){
                e.response.httpstatus = new Httpstatus(e.response.status);
                return e.response;
            }
            
            return {
                httpstatus: new Httpstatus(500),
                data: e,
            };
        }
        
    }
    
    /**
     * Get request
     * @param url
     * @param params
     * @param config
     * @return {Promise<Response>}
     */
    async get(url, configs = {}){
        try{
            if(!this.isInit){
                await this.init();
            }
            
            if(debug.enabled) debug("Http get", {url: url});
            
            return await this.client.get(url, configs || {});
        }catch(e){
            if(e.response){
                e.response.httpstatus = new Httpstatus(e.response.status);
                return e.response;
            }
            
            return {
                httpstatus: new Httpstatus(500),
                data: e,
            };
        }
    }
    
    /**
     * Post request
     * @param url
     * @param params
     * @param config
     * @return {Promise<any|axios.AxiosResponse<any>>}
     */
    async post(url, params, config = {}){
        if(!this.isInit){
            await this.init();
        }
        
        try{
            return await this.client.post(url, params, config);
        }catch(e){
            if(e.response){
                e.response.httpstatus = new Httpstatus(e.response.status);
            }
            
            return e.response;
        }
        
    }
    
    /**
     * Get request contents
     * @param url
     * @param params
     * @param config
     * @return {Promise<void>}
     */
    async contents(url, config = {}){
        return await this.get(url, config);
    }
    
    /**
     * get request binary
     * @param url
     * @param params
     * @param config
     * @return {Promise<string|axios.AxiosResponse>}
     */
    async getBinary(url, config = {}){
        $.extend(config, {
            responseType: "arraybuffer"
        });
        return await this.get(url, config);
    }
    
}

hung.http = new Http();