import debug from "debug";
const log = debug('hung:socket');

class Socket{
    constructor(){
        this.io = null
        this.connections = [];
        this.init();
    }
    
    init(){
        this.io = hung.require('socket.io')(hung.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.io.on('connection', (socket) => {
            this.connections.push(socket);
            socket.on('disconnect', () => {
                const index = this.connections.indexOf(socket);
                if(index !== -1) this.connections.splice(index, 1);
            });
        });
    }
    
    emit(event, data){
        this.connections.forEach((socket) => {
            socket.emit(event, data);
        });
    }
    
    /**
     * Register event handler
     * @param event
     * @param handler
     */
    on(event, handler){
        this.io.on('connection', (socket) => {
            socket.on(event, handler);
        });
    }
    
    /**
     * Unregister event handler
     * @param event
     * @param handler
     */
    off(event, handler){
        this.io.on('connection', (socket) => {
            socket.off(event, handler);
        });
    }
    
    /**
     * Register event handler
     * @param event
     * @param handler
     */
    once(event, handler){
        this.io.on('connection', (socket) => {
            socket.once(event, handler);
        });
    }
    
    /**
     * Unregister event handler
     * @param event
     * @param handler
     */
    removeListener(event, handler){
        this.io.on('connection', (socket) => {
            socket.removeListener(event, handler);
        });
    }
}

hung.Socket = new Socket();
export default hung.Socket;