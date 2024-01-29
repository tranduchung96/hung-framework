import debug from 'debug';

const log = debug('hung:session');
import mongoose from 'mongoose';
import hung from 'hung/core';
import expressSession from 'express-session';
import MongoStore from 'connect-mongo';

if(hung.settings["app"]['session'] == undefined){
    log("Database sessions not found ! app.json");
    process.exit(1);
}

const session = {
    createSessionStore: function(){
        let setting = hung.settings.app['session'];
        return expressSession({
            secret: setting.secret || 'fan95b8X4PpEUjE500fgskLo9gOkmQAe',
            ttl: setting.ttl || 2592000,
            saveUninitialized: false,
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                collection: setting.collection || 'customersessionstorages',
                saveUninitialized: true
            }),
            
        });
    },
    
    createSession: function(req, res, next){
        let store = this.createSessionStore();
        store(req, res, next);
        req.session = store.session;
        next();
    }
}

export default session;