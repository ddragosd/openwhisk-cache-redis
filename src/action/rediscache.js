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

function _set_handler(params, resolve, reject, redis_client) {
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
      value: params.value,
      context: params.context || null
    })
  });
  // TODO: what if value is an array ?
}

function _get_handler(params, resolve, reject, redis_client) {
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
      for (var i=0; i<fields_array.length; i++) {
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
      value: response,
      context: params.context || null
    });
  }

  if (params.fields == null) {
    redis_client.hgetall(key, get_redis_handler);
  } else {
    redis_client.hmget(key, params.fields.split(","), get_redis_handler);
  }
}

/**
 * The entry point for the action.
 * @param params Input object
 * @returns {Promise}
 */
function main(params) {
  return new Promise((resolve, reject) => {
    if (_fail_on_missing("redis_host", params, reject) || _fail_on_missing("key", params, reject) ) {
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

    if (params.value !== null && typeof(params.value) !== "undefined") {
      _set_handler(params, resolve, reject, redis_client);
      // TODO: handle timeouts
      return;
    }
    // GET values from cache
    console.log("GET key:" + params.key);
    _get_handler(params, resolve, reject, redis_client);
  });
}

export default main;
