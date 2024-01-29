import winston from 'winston';
import lodash from 'lodash';
import path from 'path';

const debuglog = hung.createDebug('hung:logger');
debuglog('Create logger');

/**
 * @var {winston.Logger}
 */
const loggererrors = winston.createLogger({
    exitOnError: false,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
                
                //Code have exceptions not catched
                if(debuglog.enabled || hung.is_development){
                    console.log(info.error || info.message);
                }
                
                let logs = `${info.timestamp} ${info.level}: ${info.message}`;
                
                if(info.meta && info.meta.length > 0){
                    logs += " - data: " + JSON.stringify(info.meta.length === 1 ? info.meta[0] : info.meta, null, 4);
                }
                
                return logs;
            }
        )),
    
    transports: [
        new winston.transports.File({filename: path.join(hung.__dirlogs, 'error.log')}),
    ],
    
    exceptionHandlers: [
        new winston.transports.File({filename: path.join(hung.__dirlogs, 'exceptions.log')})
    ],
    rejectionHandlers: [
        new winston.transports.File({filename: path.join(hung.__dirlogs, 'rejections.log')})
    ]
});

/**
 * Log msg
 * @param {Error|string} error
 * @param data
 */
function log_error(error, ...data){
    
    if(lodash.isError(error)){
        let err = "";
        if(error.stack){
            err = error.stack;
        }else{
            err = error.toString();
        }
        
        error = err;
    }
    
    loggererrors.log({
        level: 'error',
        message: error,
        meta: data
    });
    
    return loggererrors;
}

hung.log_error = log_error;

/**
 * Create logger for normal logs
 * @type {winston.Logger}
 */
const loggerlog = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
                let logs = `${info.timestamp} ${info.namespace} ${info.message}`;
                
                if(info.meta && info.meta.length > 0){
                    logs += " - data: " + JSON.stringify(info.meta.length === 1 ? info.meta[0] : info.meta, null, 4);
                }
                
                return logs;
            }
        )),
    
    transports: [
        new winston.transports.File({filename: path.join(hung.__dirlogs, 'logs.log'), level: 'info'}),
    ]
    
});

/**
 * Create logger for error logs
 * @param namespace
 * @return {function(...[*]=)}
 */
hung.createLog = function(namespace){
    debuglog('Create logger for namespace: ' + namespace);
    
    const logdebugdata = hung.createDebug(namespace);
    
    /**
     * log data
     * @param message
     * @param data
     */
    function logdata(message, ...data){
        if(lodash.isError(message)){
            message = message.message;
        }
        
        //Debug log
        logdebugdata(message, ' - data: ', ...data);
        loggerlog.log({
            level: 'info',
            namespace: namespace,
            message: message,
            meta: data
        });
    }
    
    return logdata;
}

//Create default log
hung.log = hung.createLog('hung');
hung.log.error = log_error;

export default log_error;