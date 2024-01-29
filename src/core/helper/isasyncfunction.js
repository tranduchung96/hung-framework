import lodash from 'lodash';

/**
 * Test async function
 * @return {Promise<void>}
 */
async function test(){

}

/**
 * Is async function
 * @param value
 * @return {boolean}
 */
export default function isasyncfunction(value){
    return lodash.isFunction(value) && value.constructor.name === test.constructor.name;
}