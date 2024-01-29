import lodash from "lodash";
import fs from "fs";
import path from "path";

const debug = hung.createDebug('hung:module');
debug('Load modules');

//Load commons module
if(fs.existsSync(hung.__dirmodules + '/commons/bootstrap.js')){
    await hung.app.loadModule('commons');
}

//Load modules
if(hung.settings.app.modules){
    const dataModules = hung.settings.app.modules;
    
    if(lodash.isObject(dataModules) && Object.keys(dataModules).length > 0){
        for(let moduleName in dataModules){
            if(dataModules[moduleName] == true){
                await hung.app.loadModule(moduleName);
            }
        }
    }else
        if(lodash.isString(dataModules)){
            await hung.app.loadModule(moduleName);
        }
    
}