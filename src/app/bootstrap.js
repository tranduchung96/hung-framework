//Load hung libary first
import '../main.js';

//Load app
import App from "./app.js";

const debug = hung.createDebug('hung:app:bootstrap');
debug('Bootstrap');

try{
    
    //Create app
    const app = new App();
    hung.app = app;
    global.app = app;
    
    //Load settings
    await import('./settings.js');
    
    //Load enviroment
    await import('./env.js');
    
    //Load process
    await import ('./process.js');
    
    //Load events
    await import('./events.js');
    
    //Load database
    await import ('./database.js');
    
    //Load cache
    await import('./cache.js');
    
    //Load Bootstrap
    await import('./module.js');
    
    //Load models
    await import ('./models.js');
    
    //Load modules hooks
    await import ('./hooks.js');
    
    //Init App
    debug("Init App");
    hung.emit('init');
    
    debug('on load App');
    hung.emit('load');
    
    hung.app.bootcomplete = true;
}catch(e){
    hung.log_error(e);
    hung.app.bootcomplete = false;
    hung.app.booterror = e;
}finally{
    if(hung.app.bootcomplete){
        debug('on boot complete');
        hung.emit('boot');
    }
}

export default hung.app;