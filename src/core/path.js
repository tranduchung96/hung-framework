import path from "path";
import fs from "fs-extra";
import {fileURLToPath} from 'url';
import {glob} from 'glob';
import {isMainThread} from 'worker_threads';

//Create debug
const debug = hung.createDebug('hung:path');

/**
 * get File url to path
 */
hung.fileURLToPath = function(url){
    return fileURLToPath(url);
};

/**
 * get File url to dirname
 * @param url
 * @return {string}
 */
hung.fileURLToDirname = function(url){
    return path.dirname(fileURLToPath(url));
};

//get basedir from environment
if(!process.__basedir && process.env.__basedir){
    process.__basedir = process.env.__basedir;
}

//get main file from environment
if(!process.__mainfilename && process.env.__mainfilename){
    process.__mainfilename = process.env.__mainfilename;
}

//Check basedir
let basedir = process.__basedir;

//Find basedir if not set
if(!basedir){
    let cwd = process.cwd();
    do{
        if(fs.pathExistsSync(path.join(cwd, 'bin'))){
            basedir = cwd;
            
            if(isMainThread){
                process.chdir(basedir);
            }
            break;
        }
    }while(!basedir && (cwd = path.dirname(cwd)))
}

//detect main file
if(!process.__mainfilename && fs.existsSync(path.join(basedir, 'bin', 'main.js'))){
    process.__mainfilename = path.join(basedir, 'bin', 'main.js');
}

//Define app paths
hung.__basePath = basedir;
hung.__srcdir = path.join(basedir, 'src');
hung.__dirmodules = path.join(basedir, 'src', 'modules');
hung.__diretc = path.join(basedir, 'etc');
hung.__dirbin = path.join(basedir, 'bin');
hung.__dirlogs = path.join(basedir, 'logs');
hung.__dirpublic = path.join(basedir, 'public');
hung.__dirtmp = path.join(basedir, 'tmpdir');
hung.__dirdata = path.join(basedir, 'data');
hung.__dirviews = path.join(basedir, 'views');
hung.__cookiespath = path.join(basedir, 'cookies');
hung.__main__ = process.__mainfilename;

//set basedir and main file to environment if not set
if(!process.env.__basedir){
    process.env.__basedir = basedir;
}

if(!process.env.__mainfilename){
    process.env.__mainfilename = process.__mainfilename;
}

//Extend packages
hung.path = path;
hung.fs = fs;
hung.glob = glob;
hung.globSync = glob.sync;

hung.extend(hung, {
    
    /**
     * Require in path
     */
    async importPath(directory, parrel = false, itemcallback = null){
        try{
            if(!directory){
                return false;
            }
            
            let patterns = '*.{js,mjs,cjs}';
            if(hung.isObject(directory)){
                let _tmp = directory;
                if(_tmp.patterns){
                    patterns = _tmp.patterns;
                }
                
                //directory
                directory = _tmp.directory || _tmp.dir || _tmp.path;
                
                //parrel
                parrel = _tmp.parrel || _tmp.parallel || _tmp.async;
                
                //itemcallback
                itemcallback = _tmp.itemcallback || _tmp.itemcb || _tmp.callback || itemcallback;
            }
            
            if(debug.enabled) debug('Import path: %s', directory);
            if(!fs.pathExistsSync(directory)){
                if(debug.enabled) debug('Directory not exists: %s. Can not import', directory);
                return false;
            }
            
            //get patterns
            
            let items = hung.globSync(patterns, {
                    cwd: directory
                }),
                handlers;
            
            if(hung.isFunction(parrel) && !itemcallback){
                itemcallback = parrel;
                parrel = false;
            }
            
            if(parrel){
                handlers = [];
            }
            
            if(items && items.length){
                for(let name of items){
                    let filepath = path.join(directory, name);
                    if(parrel){
                        handlers.push(hung.importFile(filepath));
                    }else{
                        let imported = await hung.importFile(filepath);
                        if(itemcallback){
                            await hung.callback(itemcallback, imported.default || imported);
                        }
                    }
                }
            }
            
            //wait all handle complete
            if(handlers && handlers.length){
                let imported = await hung.all(handlers);
                if(itemcallback){
                    for(let item of imported){
                        if(item.default){
                            await hung.callback(itemcallback, item.default);
                        }
                    }
                }
            }
            
            return true;
        }catch(e){
            hung.log_error(e);
        }
        
        return false;
    },
    
    /**
     * Import file
     * @param filepath
     * @return {Promise<void>}
     */
    async importFile(filepath){
        try{
            if(!filepath){
                return false;
            }
            
            if(debug.enabled) debug('Import file path: %s', filepath);
            if(!fs.pathExistsSync(filepath)){
                debug('File not exists: %s. Can not import', filepath);
                return false;
            }
            
            if(path.isAbsolute(filepath) && hung.os.isWindow){
                filepath = 'file://' + filepath;
            }
            
            return await import(filepath);
        }catch(e){
            hung.log_error(e);
        }
        
        return false;
    }
    
});

hung.extends(hung.path, {
    
    /**
     * get file name of file path
     * @param filepath
     */
    filename(filepath){
        return path.basename(filepath, path.extname(filepath));
    },
    
    /**
     * Get filepath from App base path
     * @param filepath
     */
    getFilepath(filepath){
        return path.join(hung.__basePath, filepath);
    },
    
    /**
     * Get file path from App data path
     * @param filepath
     */
    getDataFilepath(filepath){
        return path.join(hung.__dirdata, filepath);
    },
    
    /**
     * get etc path from App base path
     * @param filepath
     * @return {string}
     */
    getEtcPath(filepath){
        return path.join(hung.__diretc, filepath);
    }
    
});