# experimental-openwhisk-cache-redis

> STATUS: WORK IN PROGRESS

An Openwhisk action exposing a cache interface with Redis.
It is designed to expose a simple key,value interface so that the cache store can be replaced with another store, when needed.

In order to avoid key collision the action using a prefix for the keys. I.e. for a key `foo`, the actual Redis key will be `<prefix>:foo`. The `<prefix>` is generated from Openwhisk namespace API KEY (`MD5(process.env.__OW_API_KEY)`).

### Usage

#### Install the action

```bash
$ wsk package create cache # optional
$ wsk action create cache/redis ./openwhisk-cache-redis-0.0.1.js \
        --param host redis_host \
        --param auth redis_auth \
        --param max_ttl <ttl> \
        --param encrypt <true|false>
```

* `redis_host` - Redis hostname
* `redis_auth` - Redis authentication
* `max_ttl` - default Redis TTL for each key
* `encrypt` - specifies whether the action should encrypt the values

#### Caching key,value pairs

```bash
wsk action invoke cache/redis --param key my:first:key --param value hello-world
```

* `key` parameter is a string used as the Redis key
* `value` parameter is a string or an object. If it's an object, the action assumes it's a dictionary with `<key,value>` pairs to be stored as a hash map in Redis, with each value being a string.

#### Reading cached key,value pairs

```bash
wsk action invoke cache/redis --param key my:first:key --param fields field1,field2, field3
```

* `key` parameter is a string used as the Redis key
* `fields` parameter is used to retrieve only a subset of the values associated with the key, in case the value saved originally was a dictionary of `<key,value>` pairs.
