const debug = hung.createDebug('hung:app:load:middlewares');
/**
 * Load module router
 * @param moduleName
 * @param namespace
 * @param {express.Router} router
 */
export default async function loadMiddleware(moduleName, namespace, router){
    let routedir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, 'middlewares', namespace));
    if(routedir && hung.fs.existsSync(routedir)){
        
        //Load init file
        let initfile = hung.path.join(routedir, 'init.js');
        if(hung.fs.existsSync(initfile)){
            debug(`Load ${moduleName}/middlewares/${namespace} init file`);
            await hung.importFile(initfile);
        }
        
        debug(`Load ${moduleName}/middlewares/${namespace}`);
        
        let items = hung.globSync('*.{js,mjs,cjs}', {cwd: routedir});
        if(items && items.length){
            for(let name of items){
                
                //Skip init file
                if(name === 'init.js'){
                    continue;
                }
                
                //Load module file
                let filepath = hung.path.join(routedir, name);
                let module = await hung.importFile(filepath);
                
                if(module.default && hung.isFunction(module.default)){
                    let ROUTE_PATH = module.PATH_ROUTES || null;
                    if(ROUTE_PATH){
                        if(hung.isString(ROUTE_PATH)){
                            ROUTE_PATH = [ROUTE_PATH];
                        }
                        
                        ROUTE_PATH.forEach((path) => {
                            router.use(path, module.default);
                        });
                        
                    }else{
                        router.use(module.default);
                    }
                    
                    continue;
                }
                
                let routes = module.default;
                if(hung.isPlainObject(routes)){
                    routes = [routes];
                }
                
            }
        }
        
        return;
    }
    
    debug(`Not found middleware: ${moduleName}/middlewares/${namespace}`);
}