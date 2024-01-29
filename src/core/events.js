hung.extend(hung, {
    
    /**
     * on ready state
     */
    ready(callback, priority = 10){
        hung.on('ready', callback, priority);
    },
    
    /**
     * on init
     * @param callback
     */
    onInit(callback, priority = 10){
        hung.on('init', callback, priority);
    },
    
    /**
     * on Commons task process
     * @param callback
     */
    onCommonsTask(callback, priority = 10){
        hung.on('dispatch_commons_task', callback, priority);
    },
    
    /**
     * on load
     * @param callback
     * @param priority
     */
    onLoad(callback, priority = 10){
        hung.on('load', callback, priority);
    },
    
    /**
     * on Load webserver
     * @param callback
     */
    onLoadWebserver(callback, priority = 10){
        hung.on('load_app_task_webserver', callback, priority);
    },
    
    /**
     * on loaded
     * @param callback
     */
    onLoaded(callback, priority = 10){
        hung.on('loaded', callback, priority);
    },
    
    /**
     * on ready
     * @param callback
     */
    onReady(callback, priority = 10){
        hung.on('ready', callback, priority);
    },
    
    /**
     * on Load express app
     * @param callback
     */
    onLoadExpress(callback, priority = 10){
        hung.on('load_express', callback, priority);
    },
    
    /**
     * on Setup express
     * @param callback
     */
    onSetupExpress(callback, priority = 10){
        hung.on('setupexpress', callback, priority);
    },
    
    /**
     * on Middle ware router
     * @param callback
     *
     */
    onMiddleWare(callback, priority = 10){
        hung.on('middlewareexpress', callback, priority);
    },
    
    /**
     * on Middle ware router
     * @param callback
     *
     */
    onMiddleWareRouter(callback, priority = 10){
        hung.on('middlewarerouter', callback, priority);
    },
    
    /**
     * on Middle ware router
     * @param callback
     *
     */
    onMiddleWareRouterAdmin(callback, priority = 10){
        hung.on('middlewarerouter_admin', callback, priority);
    },
    
    /**
     * on Middle ware router
     * @param callback
     *
     */
    onMiddleWareRouterXda(callback, priority = 10){
        hung.on('middlewarerouter_xda', callback, priority);
    },
    
    /**
     * on Middle ware router
     * @param callback
     *
     */
    onMiddleWareRouterApi(callback, priority = 10){
        hung.on('middlewarerouter_api', callback, priority);
    },
    
    /**
     * on Web router
     * @param callback
     */
    onRouter(callback, priority = 10){
        hung.on('router', callback, priority);
    },
    
    /**
     * on Web router xda
     * @param callback
     */
    onRouterAdmin(callback, priority = 10){
        hung.on('router_admin', callback, priority);
    },
    
    /**
     * on Web router xda
     * @param callback
     */
    onRouterXda(callback, priority = 10){
        hung.on('router_xda', callback, priority);
    },
    
    /**
     * on Web router xda
     * @param callback
     */
    onRouterApi(callback, priority = 10){
        hung.on('router_api', callback, priority);
    },
    
    /**
     * on Run task process
     * @param callback
     */
    onDispatchTaskProcess(taskname, callback, priority = 10){
        hung.on('dispatch_app_task_' + taskname, callback, priority);
    },
    
    /**
     * on Task action process
     * @param action
     * @param callback
     */
    onProcessAction(action, callback, priority = 10){
        action = action.replace(/\//g, ':');
        hung.on('dispath_process_action_' + action, callback, priority);
    },
    
    /**
     * Dispatch process action
     * @param action
     * @param data
     */
    async dispatchProcessAction(action, data){
        action = action.replace(/\//g, ':');
        await hung.emit('dispath_process_action_' + action, data);
    }
    
});