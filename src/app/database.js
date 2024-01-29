//Load database
hung.on('connectdatabase', async() => {

}, 0);

if(!hung.database.isConnect() && hung.settings.app.database){
    await hung.database.connect();
}