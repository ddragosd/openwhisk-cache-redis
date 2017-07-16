const crypto = require('crypto');
var redis = require('redis');

// default field is used to adapt a SET into a HSET in Redis
// by convention, this action uses only hashes, to achieve an easier API and impl
const DEFAULT_FIELD = "_default_"

function _fail_on_missing(param_name, params, reject) {
  if (params[param_name] == null || typeof(params[param_name]) == "undefined") {
    reject({
      "message": "Parameter " + param_name + " is required."
    });
    return true;
  }
}

function _set_handler(params, redis_client) {
  return new Promise(
    (resolve, reject) => {
      let key = params.key;
      let value = params.value;
      if (typeof(value) == "string" || typeof(value) == "number" || typeof(value) == "boolean") {
        // wrap the value into an object to be used with hmset
        value = {
          [DEFAULT_FIELD]: value.toString()
        }
      }

      redis_client.hmset(key, value, (err, response) => {
        if (err !== null && typeof(err) !== "undefined") {
          console.error(err);
          reject({
            error: err.toString(),
            type: "redis_hmset"
          })
        }
        console.log("Redis response:" + response);
        resolve({
          key: key,
          value: params.value
        })
      });
    }
  );
}

function _get_handler(params, redis_client) {
  return new Promise(
    (resolve, reject) => {
      let key = params.key;
      let value = params.value;
      const get_redis_handler = (err, response) => {
        if (err !== null && typeof(err) !== "undefined") {
          console.error(err);
          reject({
            error: err.toString(),
            type: "redis_hmget"
          })
        }
        console.log("Redis response:" + JSON.stringify(response));

        // if the response is an array and params.fields is not null, match fields with response
        if (response !== null && response.constructor == Array) {
          let fields_array = params.fields.split(",");
          let response_object = {}
          for (var i = 0; i < fields_array.length; i++) {
            response_object[fields_array[i]] = response[i];
          }
          response = response_object;
        }

        // response is null when the key is missing

        if (response !== null && typeof(response) == "object") {
          if (response[DEFAULT_FIELD] !== null && typeof(response[DEFAULT_FIELD]) !== "undefined") {
            response = response[DEFAULT_FIELD];
          }
        }

        resolve({
          key: key,
          value: response
        });
      }

      if (params.fields == null) {
        redis_client.hgetall(key, get_redis_handler);
      } else {
        redis_client.hmget(key, params.fields.split(","), get_redis_handler);
      }
    }
  );
}

/**
 * The entry point for the action.
 * @param params Input object
 * @returns {Promise}
 */
function main(params) {
  return new Promise((resolve, reject) => {
    if (_fail_on_missing("redis_host", params, reject) ||
      (params.items == null && _fail_on_missing("key", params, reject))) {
      return;
    }

    if (process.env.__redis_client !== null && typeof(process.env.__redis_client) !== "undefined") {
      redis = require(process.env.__redis_client);
    }

    let redis_client = redis.createClient(params.redis_host, {
      //A string used to prefix all used keys (e.g. namespace:test)
      prefix: crypto.createHash('md5').update(process.env.__OW_API_KEY || "local").digest('hex') + ":",
      password: params.redis_auth
    });

    redis_client.on("error", (err) => {
      console.error(err);
      reject({
        error: err.toString(),
        type: "redis_conn"
      });
    });

    if (params.items === null || typeof(params.items) === "undefined") {
      params.items = [{
        key: params.key,
        value: params.value,
        fields: params.fields
      }];
    }

    let redis_ops = []; // an array with all Redis operations
    let item;
    for (var i = 0; i < params.items.length; i++) {
      item = params.items[i];
      if (item.value !== null && typeof(item.value) !== "undefined") {
        redis_ops.push(_set_handler(item, redis_client));
        continue;
      }
      // GET values from cache
      console.log("GET key:" + item.key);
      redis_ops.push(_get_handler(item, redis_client));
    }
    console.log("Executing " + redis_ops.length + " operations.");
    Promise.all(redis_ops)
      .then(results => {
        console.log("results:" + JSON.stringify(results));
        let r = {
          items: results
        };
        if (results.length == 1) {
          r = results[0];
        }
        if ( params.context !== null && typeof(params.context) !== "undefined") {
          r.context = params.context;
        }
        resolve(r);
      })
      .catch(error => {
        reject(error);
      });


  });
}

export default main;
