const debug = hung.createDebug('hung:app:cache');

//Load cache
debug('Load cache');

//Connect to cache
hung.cache.connect().then(async() => {
    debug('Connected to cache');
}).catch((e) => {
    debug('Error connect to cache: ' + e);
});

//Close cache
process.on('exit', async() => {
    debug('Close cache');
    await hung.cache.close();
});