/**
 * Sleep for a given amount of time
 * @param {number} timeout
 * @return {Promise<unknown>}
 */
function sleep(timeout = 0){
    return new Promise((resolve) => {
        setTimeout(function(){
            resolve(true);
        }, timeout || 0)
    });
}

hung.sleep = sleep;
export default sleep;