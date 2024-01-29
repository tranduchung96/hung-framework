import qs from 'qs';

//Build url functions
hung.url = {
    
    /**
     * Build query
     * @param data
     * @param options
     * @return {string}
     */
    buildQuery(data, options){
        return qs.stringify(data, options);
    },
    
};