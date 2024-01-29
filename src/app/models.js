const debug = hung.createDebug('hung:bootstrap:models');

//Load models
debug('Load models');
await hung.app.loadModulesComponents('models');