import os from 'os';

//Extends hung object with os
hung.os = {
    isWindow: process.platform === 'win32',
    isLinux: process.platform === 'linux',
    isMac: process.platform === 'darwin',
    isAndroid: process.platform === 'android',
    tmpdir: os.tmpdir(),
};

export default hung.os;