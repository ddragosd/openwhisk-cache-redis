# experimental-openwhisk-cache-redis

> STATUS: WORK IN PROGRESS

An Openwhisk action exposing a cache interface with Redis.
It is designed to expose a simple key,value interface so that the cache store can be replaced with another store, when needed.

This action assumes it's going to be used by multiple tenants; in order to avoid key collision it's using a prefix for the keys. I.e. for a key `foo` the actual Redis key will be `<prefix>:foo`. The `<prefix>` is generated from Openwhisk namespace API KEY (`process.env.__OW_API_KEY`); because the key can be long, an MD5 of it is being used.

### Usage

#### Install the action

```bash
$ wsk package create cache # optional
$ wsk action create cache/redis ./openwhisk-cache-redis-0.0.1.js \
        --param host redis_host \
        --param auth redis_auth \
        --param encrypt true \
        --param prefix some-prefix
```

#### Caching key,value pairs

```bash
wsk action invoke cache/redis --param key my:first:key --value hello-world
```
