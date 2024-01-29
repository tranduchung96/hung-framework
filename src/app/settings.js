import fs from "fs";
import debuglog from 'debug';
import lodash from "lodash";

const debug = debuglog('hung:app:setting');
let settings = {};

/**
 * get Settings
 * @param name
 */
function loadSettings(name, cacheable = true){

}

//Settings namespace
hung.settings = {
    
    /**
     * Load settings
     */
    load(name, cacheable = true){
        if(debug.enabled) debug(`Load settings ${name}`);
        
        if(cacheable && settings.hasOwnProperty(name)){
            return settings[name];
        }
        
        const jsonData = JSON.parse(fs.readFileSync(`${hung.__diretc}/${name}.json`));
        if(cacheable){
            settings[name] = jsonData;
        }
        
        return jsonData;
    },
    
    /**
     * get name
     * @param name
     * @return {*}
     */
    get(name){
        if(settings.hasOwnProperty(name)){
            return settings[name];
        }
        
        let parts     = name.split("."),
            namespace = parts.shift(),
            path      = parts.join(".");
        
        if(!settings.hasOwnProperty(namespace)){
            settings[namespace] = this.load(namespace);
        }
        
        if(path.length > 0){
            return lodash.get(settings[namespace], path);
        }
        
        return settings[namespace] || null;
    }
    
};

//Load app settings
hung.settings.app = hung.settings.load("app");

//Exit if not found app settings
if(!hung.settings.app){
    console.log("App settings not found. App not start");
    process.exit(1);
}

//Fix not found modules in settings
if(!hung.settings.app.modules){
    hung.settings.app.modules = {};
}

export default hung.settings;