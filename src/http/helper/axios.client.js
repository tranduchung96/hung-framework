import axios from 'axios';
import {parse, stringify} from 'qs';
import http from 'http';
import https from 'https';
import Httpstatus from './httpstatus.js';

let axiosClient;

/**
 * Create axios client, pre-configured with baseURL
 * @return {axios.AxiosInstance}
 */
export default function createAxiosHttp(){
    
    if(axiosClient){
        return axiosClient;
    }
    
    /**
     * Create axios client, pre-configured with baseURL
     * @type {axios.AxiosInstance}
     */
    axiosClient = axios.create({
        
        headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        },
        
        paramsSerializer: {
            encode: parse,
            serialize: stringify,
        },
        
        //Request timeout
        timeout: 1000 * 120,    // 120 seconds timeout,
        
        //KeepAlive: false,
        httpAgent: new http.Agent({keepAlive: false}),
        httpsAgent: new https.Agent({keepAlive: false}),
        
        //MaxRedirects
        maxRedirects: 10,
        
        //Decompress body
        decompress: true,
    });
    
    /**
     * Response interceptor for API calls
     */
    axiosClient.interceptors.response.use(response => {
        //Set http status
        response.httpstatus = new Httpstatus(response.status);
        
        return response;
    });
    
    return axiosClient;
};