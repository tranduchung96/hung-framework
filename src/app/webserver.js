import hung from 'hung';
import os from "os";
import http from 'http';
import webserverhandler from "./helper/webserverhandler.js";

const debug = hung.createDebug('hung:webserver');
debug("Create Http Server");

/**
 * Get port from environment and stores in Express.
 */
let port = hung.toInteger(process.env.PORT || hung.settings.app.port || hung.consts.WEB_PORT),
    keepalive = process.env.KEEPALIVE || hung.settings.app.request_keepalive || 0;

//Load express Application
await import ('./express.js');

//Create http server
let server = http.createServer(hung.express);
server.keepAliveTimeout = keepalive;
server.maxHeadersCount = 0;

/**
 *
 *  check platform window or linux
 * */
server.listen(port);
webserverhandler(server);

//Init http server
debug("Init Http Server");
hung.server = server;
hung.emit("init_http_server", hung.server);