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
        --param context object>
```

* `redis_host` - Redis hostname
* `redis_auth` - Redis authentication
* `(Not Implemented Yet)`.`max_ttl` - default Redis TTL for each key
* `(Not Implemented Yet)`.`encrypt` - specifies whether the action should encrypt the values
* `context` - an object that is passed in the response. It's usually used in sequences, in order to pass transient information from an action to another. In this case the action doesn't do anything with the context object, and it passes it through, for another action.

#### Caching key,value pairs

```bash
$ wsk action invoke cache/redis --param key my:first:key --param value hello-world
```

* `key` parameter is a string used as the Redis key
* `value` parameter is a string.

The response of the action should contain the `<key,value>` pair that has been persisted:

```bash
{
    "key": "my:first:key",
    "value": "hello-world"
}
```

##### Caching complex values
When the `value` parameter represents an object, the action assumes it's a dictionary. This dictionary is saved into a `hash map` in Redis. Each key in the dictionary represents a `field` in the `HMAP`; each value in the dictionary is saved as a string.

```bash
$ wsk action invoke cache/redis --param key my:complex:key --param value '{"a":1, "b":2, "c":3}'
```
The action should return:

```json
{
    "key": "my:complex:key",
    "value": {
        "a": 1,
        "b": 2,
        "c": 3
    }
}
```

#### Reading cached key,value pairs

```bash
$ wsk action invoke cache/redis --param key my:first:key --blocking --result

{
    "key": "my:first:key",
    "value": "hello-world"
}
```
* `key` parameter is a string used as the Redis key

#### Reading cached complex values

```bash
$ wsk action invoke cache/redis --param key my:complex:key --param fields a,c --blocking --result

{
    "key": "my:complex:key",
    "value": {
        "a": "1",
        "c": "3"
    }
}
```

* `fields` parameter is used to retrieve only a subset of the values associated with the key, in case the value saved originally was a dictionary. I.e for the saved value of `{"a":1, "b":2, "c":3}`, if `fields=a,c`, then the response contains only `{"a":1, "c":3}`


#### Performing bulk operations

For bulk operations the `items` parameter should contain the list of operations.
For example, to set multiple `<key,value>` pairs use:

```json
{
  "items": [
      {
        "key": "key-1",
        "value": "value-1"
      },
      {
        "key": "key-2",
        "value": "value-2"
      }
    ]
}
```

Usage:
```bash
$ wsk action invoke cache/redis --param-file items.json
```
