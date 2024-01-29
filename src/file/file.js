import nfs from 'fs';
import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
const debug = hung.createDebug('hung:file');

let gziphandler;

//Configs
const gzipcompressconfigs = {
    level: zlib.constants.Z_BEST_COMPRESSION, memLevel: 9
};

/**
 * Get gzip handler
 * @return {Gzip}
 */
function createGzipStream(){
    if(!gziphandler){
        gziphandler = zlib.createGzip(gzipcompressconfigs);
    }
    
    return gziphandler;
}

hung.extends(hung.fs, {
    
    /**
     * get File size
     * @param filepath
     * @return {*|boolean}
     */
    async getFileSize(filepath){
        try{
            if(!fs.existsSync(filepath)){
                return false;
            }
            
            let stats = await fs.stat(filepath);
            return stats.size;
        }catch(e){
            hung.log_error(e);
        }
        
        return false;
    },
    
    /**
     * get file contents
     * @param filepath
     * @param data
     */
    async get_contents(filepath){
        return await fs.readFile(filepath);
    },
    
    /**
     * Get gzip file contents
     * @param filepath
     * @return {Promise<Buffer|*>}
     */
    async get_gz_contents(filepath){
        return await hung.fs.readgzFile(filepath, false);
    },
    
    /**
     * Write file contents
     * @param filepath
     * @param data
     * @param options
     * @return {Promise<void>}
     */
    async put_contents(filepath, data, append = false, options = {}){
        let savepath = path.dirname(filepath);
        hung.fs.ensureDir(savepath);
        
        if(append){
            options.flag = 'a';
        }else{
            options.flag = 'w+';
        }
        
        return await fs.outputFile(filepath, data, options);
    },
    
    /**
     * Read json file
     * @param filepath
     * @return {Promise<*>}
     */
    async readjsonfile(filepath){
        try{
            if(!fs.existsSync(filepath)){
                return false;
            }
            
            return await fs.readJson(filepath);
        }catch(e){
            hung.log_error(e);
        }
        return null;
    },
    
    /**
     * Output to gzip file format
     * @param filepath
     * @param data
     */
    async put_gz_contents(filepath, data){
        try{
            let savepath = path.dirname(filepath);
            hung.fs.ensureDir(savepath);
            let contents = await zlib.gzipSync(data, gzipcompressconfigs);
            return await fs.outputFile(filepath, contents, {
                encoding: null,
                flag: 'w+'
            });
        }catch(e){
            hung.log_error(e);
        }
    },
    
    /**
     * Read gzip file
     * @param filepath
     * @return {Promise<Buffer>}
     */
    async readgzFile(filepath, buffer = true){
        if(!fs.existsSync(filepath)){
            return false;
        }
        
        let contents = await fs.readFile(filepath)
        let results = zlib.gunzipSync(contents);
        if(buffer){
            return results;
        }
        
        return results.toString();
    },
    
    /**
     * Create gzip a file
     * @param filepath
     * @param destpath
     */
    async gzipFile(filepath, destpath){
        try{
            debug('gzip file %s to file %s', filepath, destpath);
            
            if(!fs.existsSync(filepath)){
                debug('File %s not exists', filepath);
                return false;
            }
            
            // Create a readable stream for the input file.
            const inputReadStream = hung.fs.createReadStream(filepath);
            
            // Create a writable stream for the output file.
            const outputWriteStream = hung.fs.createWriteStream(destpath);
            
            // Create a gzip transform stream.
            const gzipTransformStream = createGzipStream();
            
            // Pipe the input stream through the gzip transform stream and into the output stream.
            inputReadStream.pipe(gzipTransformStream).pipe(outputWriteStream);
            
            // Wait for the output stream to finish writing.
            return await outputWriteStream.finished;
        }catch(e){
            hung.log_error(e);
        }
    },
    
    /**
     * unGzip a file
     */
    async ungzipFile(filepath, destpath){
        debug('ungzip file %s to file %s', filepath, destpath);
        
        if(!fs.existsSync(filepath)){
            debug('File %s not exists', filepath);
            return false;
        }
        
        // Create a readable stream for the input file.
        const readStream = hung.fs.createReadStream(filepath);
        const writeStream = hung.fs.createWriteStream(destpath);
        const gunzip = zlib.createGunzip();
        
        // Pipe the read stream through the gzip stream to the write stream
        readStream.pipe(gunzip).pipe(writeStream);
        
        gunzip.on('error', (err) => {
            debug('Error during decompression:', err);
        });
        
        writeStream.on('finish', () => {
            debug('File decompressed successfully.');
        });
    },
    
    /**
     * Check disk space
     * @param path
     * @return {Promise<void>}
     */
    checkDiskspace(path){
        return new Promise((resolve, reject) => {
            nfs.statfs(path, (err, result) => {
                if(err){
                    return reject(err);
                }
                
                let _result = {
                    available: result.bavail * result.bsize,
                    free: result.bfree * result.bsize,
                    total: result.blocks * result.bsize
                }
                
                _result.used = _result.total - _result.free;
                resolve(_result);
            });
        });
    },
    
    /**
     * Delet a file or directory
     * @param filepath
     */
    async delete(filepath){
        try{
            if(!fs.existsSync(filepath)){
                return false;
            }
            
            await fs.remove(filepath);
        }catch(e){
            hung.log_error(e);
        }
    }
    
});

//alias for filesystem fs
hung.file = hung.fs;