import debug from "debug";
const log = debug('hung:mongodb');
const mongoose = require('mongoose');

//define database namespace
hung.database = {
    
    isconnected: false,
    isclose: false,
    
    /**
     * Mongoose connection
     * @type {mongoose.Connection}
     */
    connection: null,
    
    /**
     * Check database is connected
     * @return {Promise<void>}
     */
    isConnect(){
        return this.isconnected;
    },
    
    /**
     * Connect to database
     */
    async connect(){
        const dbsettings = hung.settings.app.database || {};
        let connecturi = dbsettings.url || null;
        
        if(!connecturi && dbsettings.host && dbsettings.port && dbsettings.name){
            connecturi = 'mongodb://';
            if(dbsettings.username && dbsettings.password){
                connecturi += `${dbsettings.username}:${dbsettings.password}@`;
            }
            connecturi += `${dbsettings.host}:${dbsettings.port}/${dbsettings.name}`;
        }
        
        let urioptions = {
            maxPoolSize: 1000,
            minPoolSize: 4
        };
        
        connecturi += '?' + hung.url.buildQuery(urioptions);
        
        if(!connecturi){
            throw new Error('Database connect uri is required');
        }
        
        //Set debug
        mongoose.set('debug', dbsettings.debug == undefined ? false : dbsettings.debug || false);
        
        //Connected event
        mongoose.connection.on('connected', () => {
            hung.database.isconnected = true;
            log('Connected to MongoDB successfully ! : ' + connecturi);
        })
        
        //Connect error event
        mongoose.connection.on('error', (err) => {
            log(`Could not connect to MongoDB because of ${err}`)
            hung.database.isconnected = false;
            process.exit(1)
        })
        
        //Disconnected event
        mongoose.connection.on('disconnected', () => {
            hung.database.isconnected = false;
            log('Disconnected from database');
        });
        
        log("Connect to MongoDB: " + connecturi);
        hung.database.connection = await mongoose.connect(connecturi, {
        });
        
        //Process on SIGINT
        process.on('SIGINT', async() => {
            await hung.database.close();
            process.exit(0);
        });
        
        //Close the mongoose connection, when receiving SIGINT
        process.on('exit', hung.database.close);
        
        //Emit connectdatabase event
        hung.emit('connectdatabase');
        
        //return connection
        return hung.database.connection;
    },
    
    /**
     * Close database connection
     * @return {Promise<void>}
     */
    async close(){
        if(hung.database.isclose || !hung.database.isconnected){
            return;
        }
        
        log('Close the MongoDB connection');
        hung.database.isconnected = false;
        hung.database.isclose = true;
        await mongoose.connection.close();
    }
    
}