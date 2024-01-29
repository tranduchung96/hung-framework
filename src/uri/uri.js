import lodash from "lodash";
import {URL} from "url";

/**
 * Uri
 */
class Uri extends URL{
    
    /**
     * get Md5 of url
     * @return {String}
     */
    get md5(){
        return hung.md5(this.toString());
    }
    
    /**
     * get Sha1 of url
     * @return {string}
     */
    get sha1(){
        return hung.sha1(this.toString());
    }
    
    /**
     * set Query to uri
     * @param value
     */
    set query(value){
        this.search = new URLSearchParams(value);
    }
    
    /**
     * Get query
     * @return {Object | {}}
     */
    get query(){
        let returndata = {};
        for(let [key, value] of this.searchParams){
            returndata[key] = value;
        }
        return returndata;
    }
    
    /**
     * Get domain name of url without www.
     */
    get domainname(){
        let hostname = this.hostname;
        if(hostname.startsWith('www.')){
            hostname = hostname.slice(4);
        }
        
        return hostname;
    }
    
    /**
     * Add Path
     * @path {String}
     * @return {String}
     */
    setPath(path){
        this.pathname = '/' + lodash.ltrim(path, '/');
        return this;
    }
    
    /**
     * Add Query
     * @object : {dev:10}
     */
    setQueryVar(name, value = null){
        if(lodash.isObject(name)){
            for(let key in name){
                this.searchParams.set(key, name[key]);
            }
        }else{
            this.searchParams.set(name, value);
        }
        
        return this;
    }
    
    /**
     * Delete query
     * @param name
     * @return {Uri}
     */
    deleteQueryVar(name){
        this.searchParams.delete(name);
        return this;
    }
    
}

export default Uri;