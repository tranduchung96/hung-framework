const debug = hung.createDebug('hung:app:loadrouter');
/**
 * Load module router
 * @param moduleName
 * @param namespace
 */
export default async function loadController(moduleName, namespace){
    let controllerdir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, 'controllers', namespace));
    
    if(controllerdir && hung.fs.existsSync(controllerdir)){
        
        //Load init file
        let initfile = hung.path.join(controllerdir, 'init.js');
        if(hung.fs.existsSync(initfile)){
            debug(`Load ${moduleName}/${namespace} init file path: %s`, initfile);
            await hung.importFile(initfile);
        }
        
        let items = hung.globSync('*.{js,mjs,cjs}', {cwd: controllerdir});
        if(items && items.length){
            for(let name of items){
                
                //Skip init file
                if(name === 'init.js'){
                    continue;
                }
                
                //Load module file
                let filepath = hung.path.join(controllerdir, name);
                await hung.importFile(filepath);
            }
        }
        
        return;
    }
    
    debug(`Not found controller: ${moduleName}/controllers/${namespace}`);
}