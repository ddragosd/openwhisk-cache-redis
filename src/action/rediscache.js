const crypto = require('crypto');
const redis = require("redis-mock");

function _fail_on_missing(param_name,params,reject) {
  if(params[param_name] == null || typeof(params[param_name]) == "undefined"){
    reject({
      "message": "Parameter " + param_name + " is required."
    });
  }
}

/**
 * The entry point for the action.
 * @param params Input object
 * @returns {Promise}
 */
function main(params) {
    return new Promise( (resolve, reject) => {
      _fail_on_missing("redis_host", params, reject);
      _fail_on_missing("key", params, reject);
      let redis_client = redis.createClient(params.redis_host,
        {
          //A string used to prefix all used keys (e.g. namespace:test)
          prefix: crypto.createHash('md5').update(process.env.__OW_API_KEY).digest('hex'),
          password: params.redis_auth
        });

      redis_client.on("error", (err) => {
        console.error(err);
        reject({
          error: err.toString(),
          type: "redis_conn"
        });
      });

      let key = params.key;
      let value = params.value;
      if (value !== null && typeof(value) !== "undefined") {
        console.log("SET key:" + key);
        // TODO: handle timeouts
        // TODO: handle cases when value is an object
        redis_client.set(key, value, (err, response) => {
          if (err !== null && typeof(err) !== "undefined") {
            console.error(err);
            reject({
              error: err.toString(),
              type: "redis_set"
            })
          }
          console.log("Redis response:" + response);
          resolve({
            key:key,
            value:value
          })
        });
      } else {
        // GET values from cache
        console.log("GET key:" + key);
        redis_client.get(key, (err, response) => {
          if (err !== null && typeof(err) !== "undefined") {
            console.error(err);
            reject({
              error: err.toString(),
              type: "redis_get"
            })
          }
          console.log("Redis response:" + response);
          // response is null when the key is missing
          value = response;
          resolve({
            key:key,
            value:value
          })
        });
      }



      // console.log(params);
      // resolve({
      //   event: params,
      //   env: process.env
      // });

    });
}

export default main;
