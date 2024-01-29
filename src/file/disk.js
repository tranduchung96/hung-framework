hung.disk = {
    
    /**
     * get free space by gb. default is gb
     * @param path
     * @return {Promise<int>}
     */
    async getFreeSpace(path, gb = true){
        try{
            let results = await hung.fs.checkDiskspace(path);
            if(gb){
                return hung.filesizes.toGb(results.available);
            }
            
            return results.available;
        }catch(e){
            hung.log_error(e);
            return 0;
        }
    }
    
};