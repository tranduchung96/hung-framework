const debug = hung.createDebug('hung:app:loadrouter');

/**
 * Load module router
 * @param moduleName
 * @param namespace
 * @param {Router} router
 */
export default async function loadrouter(moduleName, namespace = 'routes', router){
    let routedir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, 'routes', namespace));
    if(routedir && hung.fs.existsSync(routedir)){
        
        //Load init file
        let initfile = hung.path.join(routedir, 'init.js');
        if(hung.fs.existsSync(initfile)){
            debug(`Load router ${moduleName}/routes/${namespace} init file`);
            await hung.importFile(initfile);
        }
        
        let items = hung.globSync('*.{js,mjs,cjs}', {cwd: routedir});
        if(items && items.length){
            for(let name of items){
                
                //Skip init file
                if(name === 'init.js'){
                    continue;
                }
                
                //Load module file
                let filepath = hung.path.join(routedir, name);
                name = hung.path.basename(name, hung.path.extname(filepath));
                
                debug(`Load ${moduleName}/routes/${namespace} file path: %s`, filepath);
                let module = await hung.importFile(filepath);
                
                //get default export
                if(!module.default){
                    throw new Error(`Not found default export in file: ${filepath}`);
                }
                
                //Route default export as function
                if(hung.isFunction(module.default)){
                    let ROUTE_PATH = module.PATH_ROUTES || ('/' + name);
                    let ROUTE_METHODS = module.ROUTE_METHODS || ['get'];
                    
                    if(hung.isString(ROUTE_METHODS)){
                        ROUTE_METHODS = [ROUTE_METHODS];
                    }
                    
                    if(hung.isString(ROUTE_PATH)){
                        ROUTE_PATH = [ROUTE_PATH];
                    }
                    
                    for(let method of ROUTE_METHODS){
                        let methodname = method.toLowerCase();
                        if(router[methodname]){
                            debug(`Load ${moduleName}/routes/${namespace} method: %s`, method);
                            for(let routepath of ROUTE_PATH){
                                debug(`Load ${moduleName}/routes/${namespace} method: %s, path: %s`, method, routepath);
                                router[methodname](routepath, module.default);
                            }
                        }
                    }
                    
                    continue;
                }
                
                let routes = module.default;
                if(hung.isPlainObject(routes)){
                    routes = [routes];
                }
                
                //Export as array of route
                if(hung.isArray(routes)){
                    for(let item of routes){
                        let route = item.route;
                        let method = item.method || 'get';
                        let controller = item.controller;
                        let action = item.action;
                        let defaultargs = item.args || {};
                        
                        if(!hung.isArray(route)){
                            route = [route];
                        }
                        
                        if(!hung.isArray(method)){
                            method = [method];
                        }
                        
                        //Add route to router
                        for(const path of route){
                            
                            if(!hung.isString(path)){
                                throw new Error(`Invalid route path: ${path}`);
                            }
                            
                            for(const _method of method){
                                
                                if(!hung.isFunction(router[_method])){
                                    throw new Error(`Not found method ${_method} in router`);
                                }
                                
                                /**
                                 * @param {express.Request} req
                                 * @param {express.Response} res
                                 */
                                router[_method](path, async function(req, res, next){
                                    try{
                                        if(!hung.isEmpty(defaultargs)){
                                            hung.defaults(req.params, defaultargs);
                                        }
                                        
                                        let handlercontroller = new controller(req, res, next);
                                        handlercontroller.dispatch(action);
                                    }catch(e){
                                        next(e);
                                    }
                                });
                            }
                            
                        }
                    }
                }
            }
        }
        
        return;
    }
    
    debug(`Not found routes: ${moduleName}/routes/${namespace}`);
}