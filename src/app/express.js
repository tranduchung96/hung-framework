import path from "path";
import sha1 from 'sha1';
import timeout from 'connect-timeout';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import requestlog from 'morgan';
import cors from 'cors';
import createError from 'http-errors'
import xXssProtection from 'x-xss-protection';
import loadrouter from "./helper/loadrouter.js";
import loadcontroller from "./helper/loadcontroller.js";
import loadmiddleware from "./helper/loadmiddleware.js";

const debug = hung.createDebug('hung:express:main');

//Create App Express
debug("Create App Express");
hung.express = express();

hung.express.disable('etag');

//Add trust proxy
hung.express.enable('trust proxy');

//Add disable x-powered-by
hung.express.disable('x-powered-by');

//Add parser
hung.express.use(bodyParser.json({limit: "1gb"}));
hung.express.use(
    bodyParser.urlencoded({
        limit: "1gb",
        extended: true,
        parameterLimit: 500000,
    })
);

//Add cookie parser
hung.express.use(cookieParser());
hung.express.use(express.urlencoded({
    extended: true,
    limit: "1gb",
    parameterLimit: 500000,
}));

//Upload file parser
import multer from "multer";
const upload = multer();
hung.express.use(upload.any());

//Add end status
hung.express.use(function(req, res, next){
    
    req.starttime = new Date();
    const end = res.end;
    
    if(debug.enabled){
        debug("Request start: ", req.starttime.toUTCString());
    }
    
    //Connection
    res.removeHeader('Connection');
    
    //Add res object
    req.request_error = function(message = 'Server error', code = 500){
        res.status(code).send(message);
    };
    
    res.end = function(){
        res.isSent = true;
        let ret = end.apply(res, arguments);
        
        if(debug.enabled){
            debug("Request complete in %d ms", Date.now() - req.starttime.getTime());
        }
        
        return ret;
    };
    
    next();
});

/**
 * Setup views engine
 */
hung.express.set('views', hung.views.paths);
hung.express.set('views cache', !hung.is_development);
hung.express.set('views engine', 'ejs');

//Init app express
await hung.emit("load_express", hung.express);
await hung.emit('setupexpress', hung.express);
await hung.emit('middlewareexpress', hung.express);

//Setup route event
hung.router = express.Router();
hung.routeradmin = express.Router();
hung.routerxda = express.Router();
hung.routerapi = express.Router();

//Load controllers
for(let moduleName in hung.app.modules){
    debug("Load controllers of module: ", moduleName);
    await hung.all([
        loadcontroller(moduleName, 'pages'),
        loadcontroller(moduleName, 'admin'),
        loadcontroller(moduleName, 'xda'),
        loadcontroller(moduleName, 'api')
    ]);
}

//Load middelware
for(let moduleName in hung.app.modules){
    debug("Load middleware of module: ", moduleName);
    await hung.all([
        loadmiddleware(moduleName, 'pages', hung.router),
        loadmiddleware(moduleName, 'admin', hung.routeradmin),
        loadmiddleware(moduleName, 'xda', hung.routerxda),
        loadmiddleware(moduleName, 'api', hung.routerapi)
    ]);
}

//Load routers
for(let moduleName in hung.app.modules){
    try{
        debug("Load routes of module: ", moduleName);
        await hung.all([
            loadrouter(moduleName, 'pages', hung.router),
            loadrouter(moduleName, 'admin', hung.routeradmin),
            loadrouter(moduleName, 'xda', hung.routerxda),
            loadrouter(moduleName, 'api', hung.routerapi)
        ]);
    }catch(e){
        hung.log_error(e);
        process.exit(1);
    }
}

debug('Setup express middlewarerouter');
await hung.emit("middlewarerouter", hung.router, hung.express);
await hung.emit("middlewarerouter_admin", hung.routeradmin, hung.express);
await hung.emit("middlewarerouter_xda", hung.routerxda, hung.express);
await hung.emit("middlewarerouter_xda", hung.routerapi, hung.express);

debug('Setup express router');
await hung.emit("router", hung.router, hung.express);
await hung.emit("router_admin", hung.routeradmin, hung.express);
await hung.emit("router_xda", hung.routerxda, hung.express);
await hung.emit("router_api", hung.routerapi, hung.express);

/**
 * Load route
 */
debug('Load express router');
hung.express.use(hung.router);
hung.express.use('/admin', hung.routeradmin);
hung.express.use('/xda', hung.routerxda);
hung.express.use(hung.settings.app.api_request_prefix || '/api', hung.routerapi);

/**
 * catch 404 and forward to error handler
 */
hung.express.use(function(req, res, next){
    next(createError(404));
});

/**
 * Error handler
 * @param err
 * @param {express.Request} req
 * @param {express.Response} res
 *
 */
hung.express.use(function(err, req, res, next){
    if(!res.status){
        res.status = 500;
    }
    
    // set locals, only providing error in development
    res.status(err.status || 500).send(err.message);
});

export default hung.express;