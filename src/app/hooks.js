/**
 * Load modules hooks
 */
const debug = hung.createDebug('hung:app:hooks');
debug('Load modules hooks');

for(let moduleName in hung.app.modules){
    debug(`Load hooks of module: ${moduleName}`);
    let hookdir = hung.path.resolve(hung.path.join(hung.__dirmodules, moduleName, 'hooks'));
    if(hung.fs.existsSync(hookdir)){
        hung.importPath({
            path: hookdir,
            patterns: '**/*.{js,mjs,cjs}',
        })
    }
}