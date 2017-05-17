/**
 * The entry point for the action.
 * @param params Input object
 * @returns {Promise}
 */
function main(params) {
    console.log(params);
    return {
      event: params,
      env: process.env
    }
}

export default main;
