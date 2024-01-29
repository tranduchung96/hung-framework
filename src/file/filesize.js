hung.filesizes = {
    
    /**
     * Format bytes to human readable format
     * @param size
     * @param decimals
     */
    format(size, decimals = 2){
        if(size === 0){
            return '0 Bytes';
        }
        
        let k = 1024;
        let dm = decimals < 0 ? 0 : decimals;
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let i = Math.floor(Math.log(size) / Math.log(k));
        
        return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * Convert bytes to kb
     * @param size
     * @param decimals
     * @return {number}
     */
    toKb(size, decimals = 2){
        return Number((size / 1024).toFixed(decimals));
    },
    
    /**
     * Convert bytes to mb
     * @param size
     * @param decimals
     * @return {number}
     */
    toMb(size, decimals = 2){
        return Number((size / 1024 / 1024).toFixed(decimals));
    },
    
    /**
     * Convert bytes to gb
     * @param size
     * @param decimals
     * @return {number}
     */
    toGb(size, decimals = 2){
        return Number((size / 1024 / 1024 / 1024).toFixed(decimals));
    },
    
    /**
     * Convert Gb to bytes
     * @param size
     * @return {number}
     */
    gbtoBytes(size){
        return size * 1024 * 1024 * 1024;
    },
    
    /**
     * Convert Mb to bytes
     * @param size
     * @return {number}
     */
    mbtoBytes(size){
        return size * 1024 * 1024;
    },
    
    /**
     * Convert Kb to bytes
     * @param size
     * @return {number}
     */
    kbtoBytes(size){
        return size * 1024;
    }
    
};