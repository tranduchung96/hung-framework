import hung from 'hung/core';

//Json encode / decode
hung.json = {
    
    /**
     * Read json file
     * @param filepath
     * @param encode
     */
    async readfromfile(filepath, encode = 'utf8'){
        if(!hung.fileExist(filepath)){
            return null;
        }
        
        let contents = await hung.readFile(filepath);
        return JSON.parse(contents);
    }
    
}