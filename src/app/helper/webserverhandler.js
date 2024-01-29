const debug = hung.createDebug('hung:app:webserver');

/**
 * Handle the webserver
 * @param {http.Server} server
 */
export default function(server){
    
    //On Server error
    server.on('error', (error) => {
        if(error.syscall !== 'listen'){
            throw error;
        }
        let bind = typeof port === 'string'
                   ? 'Pipe ' + port
                   : 'Port ' + port;
        // handle specific listen errors with friendly messages
        switch(error.code){
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    
    //On listening
    server.on('listening', () => {
        let addr = server.address();
        let bind = typeof addr === 'string'
                   ? 'pipe ' + addr
                   : 'Port http://' + addr.address + ':' + addr.port + ' - IPv: ' + addr.family
        
        if(debug.enabled) debug('Listening on', bind);
    });
    
    server.on('close', async() => {
        if(debug.enabled){
            debug("Http Server Closed with connections:", await server.getConnections());
        }
    });
    
    //Close server on shutdown
    hung.on('beforeshutdown', () => {
        return new Promise(async(resolve, reject) => {
            try{
                if(debug.enabled) debug("Server close");
                server.close(() => {
                    if(debug.enabled) debug("Server close successfully");
                    resolve();
                });
            }catch(e){
                reject(e);
            }
        });
    });
    
};
