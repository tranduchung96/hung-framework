import os from "os";
import cluster from "cluster";
import path from "path";
import fs from "fs-extra";

//CPU cores
const cpus = os.cpus().length;

hung.consts = {
    
    CPU_CORES: cpus,
    
    /**
     * Web server instances
     */
    WEB_INSTANCE: 32,
    
    /**
     * Web server port
     */
    WEB_PORT: 8100,
    
    /**
     * UV_THREADPOOL_SIZE
     */
    UV_THREADPOOL_SIZE: 64,
    
};