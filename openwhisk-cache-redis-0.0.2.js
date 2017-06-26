require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,"/Users/ddascal/Projects/bladerunner/experimental-openwhisk-cache-redis/node_modules/bindings/bindings.js")
},{"fs":undefined,"path":undefined}],2:[function(require,module,exports){
/**
 * Copyright (c) 2013 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use strict";
function Deque(capacity) {
    this._capacity = getCapacity(capacity);
    this._length = 0;
    this._front = 0;
    if (isArray(capacity)) {
        var len = capacity.length;
        for (var i = 0; i < len; ++i) {
            this[i] = capacity[i];
        }
        this._length = len;
    }
}

Deque.prototype.toArray = function Deque$toArray() {
    var len = this._length;
    var ret = new Array(len);
    var front = this._front;
    var capacity = this._capacity;
    for (var j = 0; j < len; ++j) {
        ret[j] = this[(front + j) & (capacity - 1)];
    }
    return ret;
};

Deque.prototype.push = function Deque$push(item) {
    var argsLength = arguments.length;
    var length = this._length;
    if (argsLength > 1) {
        var capacity = this._capacity;
        if (length + argsLength > capacity) {
            for (var i = 0; i < argsLength; ++i) {
                this._checkCapacity(length + 1);
                var j = (this._front + length) & (this._capacity - 1);
                this[j] = arguments[i];
                length++;
                this._length = length;
            }
            return length;
        }
        else {
            var j = this._front;
            for (var i = 0; i < argsLength; ++i) {
                this[(j + length) & (capacity - 1)] = arguments[i];
                j++;
            }
            this._length = length + argsLength;
            return length + argsLength;
        }

    }

    if (argsLength === 0) return length;

    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = item;
    this._length = length + 1;
    return length + 1;
};

Deque.prototype.pop = function Deque$pop() {
    var length = this._length;
    if (length === 0) {
        return void 0;
    }
    var i = (this._front + length - 1) & (this._capacity - 1);
    var ret = this[i];
    this[i] = void 0;
    this._length = length - 1;
    return ret;
};

Deque.prototype.shift = function Deque$shift() {
    var length = this._length;
    if (length === 0) {
        return void 0;
    }
    var front = this._front;
    var ret = this[front];
    this[front] = void 0;
    this._front = (front + 1) & (this._capacity - 1);
    this._length = length - 1;
    return ret;
};

Deque.prototype.unshift = function Deque$unshift(item) {
    var length = this._length;
    var argsLength = arguments.length;


    if (argsLength > 1) {
        var capacity = this._capacity;
        if (length + argsLength > capacity) {
            for (var i = argsLength - 1; i >= 0; i--) {
                this._checkCapacity(length + 1);
                var capacity = this._capacity;
                var j = (((( this._front - 1 ) &
                    ( capacity - 1) ) ^ capacity ) - capacity );
                this[j] = arguments[i];
                length++;
                this._length = length;
                this._front = j;
            }
            return length;
        }
        else {
            var front = this._front;
            for (var i = argsLength - 1; i >= 0; i--) {
                var j = (((( front - 1 ) &
                    ( capacity - 1) ) ^ capacity ) - capacity );
                this[j] = arguments[i];
                front = j;
            }
            this._front = front;
            this._length = length + argsLength;
            return length + argsLength;
        }
    }

    if (argsLength === 0) return length;

    this._checkCapacity(length + 1);
    var capacity = this._capacity;
    var i = (((( this._front - 1 ) &
        ( capacity - 1) ) ^ capacity ) - capacity );
    this[i] = item;
    this._length = length + 1;
    this._front = i;
    return length + 1;
};

Deque.prototype.peekBack = function Deque$peekBack() {
    var length = this._length;
    if (length === 0) {
        return void 0;
    }
    var index = (this._front + length - 1) & (this._capacity - 1);
    return this[index];
};

Deque.prototype.peekFront = function Deque$peekFront() {
    if (this._length === 0) {
        return void 0;
    }
    return this[this._front];
};

Deque.prototype.get = function Deque$get(index) {
    var i = index;
    if ((i !== (i | 0))) {
        return void 0;
    }
    var len = this._length;
    if (i < 0) {
        i = i + len;
    }
    if (i < 0 || i >= len) {
        return void 0;
    }
    return this[(this._front + i) & (this._capacity - 1)];
};

Deque.prototype.isEmpty = function Deque$isEmpty() {
    return this._length === 0;
};

Deque.prototype.clear = function Deque$clear() {
    var len = this._length;
    var front = this._front;
    var capacity = this._capacity;
    for (var j = 0; j < len; ++j) {
        this[(front + j) & (capacity - 1)] = void 0;
    }
    this._length = 0;
    this._front = 0;
};

Deque.prototype.toString = function Deque$toString() {
    return this.toArray().toString();
};

Deque.prototype.valueOf = Deque.prototype.toString;
Deque.prototype.removeFront = Deque.prototype.shift;
Deque.prototype.removeBack = Deque.prototype.pop;
Deque.prototype.insertFront = Deque.prototype.unshift;
Deque.prototype.insertBack = Deque.prototype.push;
Deque.prototype.enqueue = Deque.prototype.push;
Deque.prototype.dequeue = Deque.prototype.shift;
Deque.prototype.toJSON = Deque.prototype.toArray;

Object.defineProperty(Deque.prototype, "length", {
    get: function() {
        return this._length;
    },
    set: function() {
        throw new RangeError("");
    }
});

Deque.prototype._checkCapacity = function Deque$_checkCapacity(size) {
    if (this._capacity < size) {
        this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
    }
};

Deque.prototype._resizeTo = function Deque$_resizeTo(capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    if (front + length > oldCapacity) {
        var moveItemsCount = (front + length) & (oldCapacity - 1);
        arrayMove(this, 0, this, oldCapacity, moveItemsCount);
    }
};


var isArray = Array.isArray;

function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function pow2AtLeast(n) {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
}

function getCapacity(capacity) {
    if (typeof capacity !== "number") {
        if (isArray(capacity)) {
            capacity = capacity.length;
        }
        else {
            return 16;
        }
    }
    return pow2AtLeast(
        Math.min(
            Math.max(16, capacity), 1073741824)
    );
}

module.exports = Deque;

},{}],3:[function(require,module,exports){
var net = require("net"),
    hiredis = require('bindings')('hiredis.node');

var bufStar = new Buffer("*", "ascii");
var bufDollar = new Buffer("$", "ascii");
var bufCrlf = new Buffer("\r\n", "ascii");

exports.Reader = hiredis.Reader;

exports.writeCommand = function() {
    var args = arguments,
        bufLen = new Buffer(String(args.length), "ascii"),
        parts = [bufStar, bufLen, bufCrlf],
        size = 3 + bufLen.length;

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (!Buffer.isBuffer(arg))
            arg = new Buffer(String(arg));

        bufLen = new Buffer(String(arg.length), "ascii");
        parts = parts.concat([
            bufDollar, bufLen, bufCrlf,
            arg, bufCrlf
        ]);
        size += 5 + bufLen.length + arg.length;
    }

    return Buffer.concat(parts, size);
}

exports.createConnection = function(port, host) {
    var s = net.createConnection(port || 6379, host);
    var r = new hiredis.Reader();
    var _write = s.write;

    s.write = function() {
        var data = exports.writeCommand.apply(this, arguments);
        return _write.call(s, data);
    }

    s.on("data", function(data) {
        var reply;
        r.feed(data);
        try {
            while((reply = r.get()) !== undefined)
                s.emit("reply", reply);
        } catch(err) {
            r = null;
            s.emit("error", err);
            s.destroy();
        }
    });

    return s;
}


},{"bindings":1,"net":undefined}],4:[function(require,module,exports){
module.exports={
  "append": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "asking": {
    "arity": 1,
    "flags": [
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "auth": {
    "arity": 2,
    "flags": [
      "noscript",
      "loading",
      "stale",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "bgrewriteaof": {
    "arity": 1,
    "flags": [
      "admin"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "bgsave": {
    "arity": -1,
    "flags": [
      "admin"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "bitcount": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "bitfield": {
    "arity": -2,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "bitop": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 2,
    "keyStop": -1,
    "step": 1
  },
  "bitpos": {
    "arity": -3,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "blpop": {
    "arity": -3,
    "flags": [
      "write",
      "noscript"
    ],
    "keyStart": 1,
    "keyStop": -2,
    "step": 1
  },
  "brpop": {
    "arity": -3,
    "flags": [
      "write",
      "noscript"
    ],
    "keyStart": 1,
    "keyStop": -2,
    "step": 1
  },
  "brpoplpush": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "noscript"
    ],
    "keyStart": 1,
    "keyStop": 2,
    "step": 1
  },
  "client": {
    "arity": -2,
    "flags": [
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "cluster": {
    "arity": -2,
    "flags": [
      "admin"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "command": {
    "arity": 1,
    "flags": [
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "config": {
    "arity": -2,
    "flags": [
      "admin",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "dbsize": {
    "arity": 1,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "debug": {
    "arity": -1,
    "flags": [
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "decr": {
    "arity": 2,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "decrby": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "del": {
    "arity": -2,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "discard": {
    "arity": 1,
    "flags": [
      "noscript",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "dump": {
    "arity": 2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "echo": {
    "arity": 2,
    "flags": [
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "eval": {
    "arity": -3,
    "flags": [
      "noscript",
      "movablekeys"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "evalsha": {
    "arity": -3,
    "flags": [
      "noscript",
      "movablekeys"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "exec": {
    "arity": 1,
    "flags": [
      "noscript",
      "skip_monitor"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "exists": {
    "arity": -2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "expire": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "expireat": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "flushall": {
    "arity": -1,
    "flags": [
      "write"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "flushdb": {
    "arity": -1,
    "flags": [
      "write"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "geoadd": {
    "arity": -5,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "geodist": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "geohash": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "geopos": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "georadius": {
    "arity": -6,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "georadiusbymember": {
    "arity": -5,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "get": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "getbit": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "getrange": {
    "arity": 4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "getset": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hdel": {
    "arity": -3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hexists": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hget": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hgetall": {
    "arity": 2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hincrby": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hincrbyfloat": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hkeys": {
    "arity": 2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hlen": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hmget": {
    "arity": -3,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hmset": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "host:": {
    "arity": -1,
    "flags": [
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "hscan": {
    "arity": -3,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hset": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hsetnx": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hstrlen": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "hvals": {
    "arity": 2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "incr": {
    "arity": 2,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "incrby": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "incrbyfloat": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "info": {
    "arity": -1,
    "flags": [
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "keys": {
    "arity": 2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "lastsave": {
    "arity": 1,
    "flags": [
      "random",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "latency": {
    "arity": -2,
    "flags": [
      "admin",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "lindex": {
    "arity": 3,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "linsert": {
    "arity": 5,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "llen": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lpop": {
    "arity": 2,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lpush": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lpushx": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lrange": {
    "arity": 4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lrem": {
    "arity": 4,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "lset": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "ltrim": {
    "arity": 4,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "memory": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "mget": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "migrate": {
    "arity": -6,
    "flags": [
      "write",
      "movablekeys"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "module": {
    "arity": -2,
    "flags": [
      "admin",
      "noscript"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "monitor": {
    "arity": 1,
    "flags": [
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "move": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "mset": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 2
  },
  "msetnx": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 2
  },
  "multi": {
    "arity": 1,
    "flags": [
      "noscript",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "object": {
    "arity": 3,
    "flags": [
      "readonly"
    ],
    "keyStart": 2,
    "keyStop": 2,
    "step": 2
  },
  "persist": {
    "arity": 2,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "pexpire": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "pexpireat": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "pfadd": {
    "arity": -2,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "pfcount": {
    "arity": -2,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "pfdebug": {
    "arity": -3,
    "flags": [
      "write"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "pfmerge": {
    "arity": -2,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "pfselftest": {
    "arity": 1,
    "flags": [
      "admin"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "ping": {
    "arity": -1,
    "flags": [
      "stale",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "post": {
    "arity": -1,
    "flags": [
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "psetex": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "psubscribe": {
    "arity": -2,
    "flags": [
      "pubsub",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "psync": {
    "arity": 3,
    "flags": [
      "readonly",
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "pttl": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "publish": {
    "arity": 3,
    "flags": [
      "pubsub",
      "loading",
      "stale",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "pubsub": {
    "arity": -2,
    "flags": [
      "pubsub",
      "random",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "punsubscribe": {
    "arity": -1,
    "flags": [
      "pubsub",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "quit": {
    "arity": 1,
    "flags": [
      "loading",
      "stale",
      "readonly"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "randomkey": {
    "arity": 1,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "readonly": {
    "arity": 1,
    "flags": [
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "readwrite": {
    "arity": 1,
    "flags": [
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "rename": {
    "arity": 3,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 2,
    "step": 1
  },
  "renamenx": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 2,
    "step": 1
  },
  "replconf": {
    "arity": -1,
    "flags": [
      "admin",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "restore": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "restore-asking": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom",
      "asking"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "role": {
    "arity": 1,
    "flags": [
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "rpop": {
    "arity": 2,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "rpoplpush": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 2,
    "step": 1
  },
  "rpush": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "rpushx": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "sadd": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "save": {
    "arity": 1,
    "flags": [
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "scan": {
    "arity": -2,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "scard": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "script": {
    "arity": -2,
    "flags": [
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "sdiff": {
    "arity": -2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "sdiffstore": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "select": {
    "arity": 2,
    "flags": [
      "loading",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "set": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "setbit": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "setex": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "setnx": {
    "arity": 3,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "setrange": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "shutdown": {
    "arity": -1,
    "flags": [
      "admin",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "sinter": {
    "arity": -2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "sinterstore": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "sismember": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "slaveof": {
    "arity": 3,
    "flags": [
      "admin",
      "noscript",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "slowlog": {
    "arity": -2,
    "flags": [
      "admin"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "smembers": {
    "arity": 2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "smove": {
    "arity": 4,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 2,
    "step": 1
  },
  "sort": {
    "arity": -2,
    "flags": [
      "write",
      "denyoom",
      "movablekeys"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "spop": {
    "arity": -2,
    "flags": [
      "write",
      "random",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "srandmember": {
    "arity": -2,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "srem": {
    "arity": -3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "sscan": {
    "arity": -3,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "strlen": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "subscribe": {
    "arity": -2,
    "flags": [
      "pubsub",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "substr": {
    "arity": 4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "sunion": {
    "arity": -2,
    "flags": [
      "readonly",
      "sort_for_script"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "sunionstore": {
    "arity": -3,
    "flags": [
      "write",
      "denyoom"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "swapdb": {
    "arity": 3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "sync": {
    "arity": 1,
    "flags": [
      "readonly",
      "admin",
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "time": {
    "arity": 1,
    "flags": [
      "random",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "touch": {
    "arity": -2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "ttl": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "type": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "unlink": {
    "arity": -2,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "unsubscribe": {
    "arity": -1,
    "flags": [
      "pubsub",
      "noscript",
      "loading",
      "stale"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "unwatch": {
    "arity": 1,
    "flags": [
      "noscript",
      "fast"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "wait": {
    "arity": 3,
    "flags": [
      "noscript"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "watch": {
    "arity": -2,
    "flags": [
      "noscript",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": -1,
    "step": 1
  },
  "zadd": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zcard": {
    "arity": 2,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zcount": {
    "arity": 4,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zincrby": {
    "arity": 4,
    "flags": [
      "write",
      "denyoom",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zinterstore": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom",
      "movablekeys"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  },
  "zlexcount": {
    "arity": 4,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrange": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrangebylex": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrangebyscore": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrank": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrem": {
    "arity": -3,
    "flags": [
      "write",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zremrangebylex": {
    "arity": 4,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zremrangebyrank": {
    "arity": 4,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zremrangebyscore": {
    "arity": 4,
    "flags": [
      "write"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrevrange": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrevrangebylex": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrevrangebyscore": {
    "arity": -4,
    "flags": [
      "readonly"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zrevrank": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zscan": {
    "arity": -3,
    "flags": [
      "readonly",
      "random"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zscore": {
    "arity": 3,
    "flags": [
      "readonly",
      "fast"
    ],
    "keyStart": 1,
    "keyStop": 1,
    "step": 1
  },
  "zunionstore": {
    "arity": -4,
    "flags": [
      "write",
      "denyoom",
      "movablekeys"
    ],
    "keyStart": 0,
    "keyStop": 0,
    "step": 0
  }
}
},{}],5:[function(require,module,exports){
'use strict'

var commands = require('./commands.json')

/**
 * Redis command list
 *
 * All commands are lowercased.
 *
 * @var {string[]}
 * @public
 */
exports.list = Object.keys(commands)

var flags = {}
exports.list.forEach(function (commandName) {
  flags[commandName] = commands[commandName].flags.reduce(function (flags, flag) {
    flags[flag] = true
    return flags
  }, {})
})
/**
 * Check if the command exists
 *
 * @param {string} commandName - the command name
 * @return {boolean} result
 * @public
 */
exports.exists = function (commandName) {
  return Boolean(commands[commandName])
}

/**
 * Check if the command has the flag
 *
 * Some of possible flags: readonly, noscript, loading
 * @param {string} commandName - the command name
 * @param {string} flag - the flag to check
 * @return {boolean} result
 * @public
 */
exports.hasFlag = function (commandName, flag) {
  if (!flags[commandName]) {
    throw new Error('Unknown command ' + commandName)
  }

  return Boolean(flags[commandName][flag])
}

/**
 * Get indexes of keys in the command arguments
 *
 * @param {string} commandName - the command name
 * @param {string[]} args - the arguments of the command
 * @param {object} [options] - options
 * @param {boolean} [options.parseExternalKey] - parse external keys
 * @return {number[]} - the list of the index
 * @public
 *
 * @example
 * ```javascript
 * getKeyIndexes('set', ['key', 'value']) // [0]
 * getKeyIndexes('mget', ['key1', 'key2']) // [0, 1]
 * ```
 */
exports.getKeyIndexes = function (commandName, args, options) {
  var command = commands[commandName]
  if (!command) {
    throw new Error('Unknown command ' + commandName)
  }

  if (!Array.isArray(args)) {
    throw new Error('Expect args to be an array')
  }

  var keys = []
  var i, keyStart, keyStop, parseExternalKey
  switch (commandName) {
    case 'zunionstore':
    case 'zinterstore':
      keys.push(0)
    // fall through
    case 'eval':
    case 'evalsha':
      keyStop = Number(args[1]) + 2
      for (i = 2; i < keyStop; i++) {
        keys.push(i)
      }
      break
    case 'sort':
      parseExternalKey = options && options.parseExternalKey
      keys.push(0)
      for (i = 1; i < args.length - 1; i++) {
        if (typeof args[i] !== 'string') {
          continue
        }
        var directive = args[i].toUpperCase()
        if (directive === 'GET') {
          i += 1
          if (args[i] !== '#') {
            if (parseExternalKey) {
              keys.push([i, getExternalKeyNameLength(args[i])])
            } else {
              keys.push(i)
            }
          }
        } else if (directive === 'BY') {
          i += 1
          if (parseExternalKey) {
            keys.push([i, getExternalKeyNameLength(args[i])])
          } else {
            keys.push(i)
          }
        } else if (directive === 'STORE') {
          i += 1
          keys.push(i)
        }
      }
      break
    case 'migrate':
      if (args[2] === '') {
        for (i = 5; i < args.length - 1; i++) {
          if (args[i].toUpperCase() === 'KEYS') {
            for (var j = i + 1; j < args.length; j++) {
              keys.push(j)
            }
            break
          }
        }
      } else {
        keys.push(2)
      }
      break
    default:
    // step has to be at least one in this case, otherwise the command does not contain a key
      if (command.step > 0) {
        keyStart = command.keyStart - 1
        keyStop = command.keyStop > 0 ? command.keyStop : args.length + command.keyStop + 1
        for (i = keyStart; i < keyStop; i += command.step) {
          keys.push(i)
        }
      }
      break
  }

  return keys
}

function getExternalKeyNameLength (key) {
  if (typeof key !== 'string') {
    key = String(key)
  }
  var hashPos = key.indexOf('->')
  return hashPos === -1 ? key.length : hashPos
}

},{"./commands.json":4}],6:[function(require,module,exports){
'use strict'

module.exports = require('./lib/parser')
module.exports.ReplyError = require('./lib/replyError')
module.exports.RedisError = require('./lib/redisError')
module.exports.ParserError = require('./lib/redisError')

},{"./lib/parser":8,"./lib/redisError":10,"./lib/replyError":11}],7:[function(require,module,exports){
'use strict'

var hiredis = require('hiredis')
var ReplyError = require('../lib/replyError')
var ParserError = require('../lib/parserError')

/**
 * Parse data
 * @param parser
 * @returns {*}
 */
function parseData (parser, data) {
  try {
    return parser.reader.get()
  } catch (err) {
    // Protocol errors land here
    // Reset the parser. Otherwise new commands can't be processed properly
    parser.reader = new hiredis.Reader(parser.options)
    parser.returnFatalError(new ParserError(err.message, JSON.stringify(data), -1))
  }
}

/**
 * Hiredis Parser
 * @param options
 * @constructor
 */
function HiredisReplyParser (options) {
  this.returnError = options.returnError
  this.returnFatalError = options.returnFatalError || options.returnError
  this.returnReply = options.returnReply
  this.name = 'hiredis'
  this.options = {
    return_buffers: !!options.returnBuffers
  }
  this.reader = new hiredis.Reader(this.options)
}

HiredisReplyParser.prototype.execute = function (data) {
  this.reader.feed(data)
  var reply = parseData(this, data)

  while (reply !== undefined) {
    if (reply && reply.name === 'Error') {
      this.returnError(new ReplyError(reply.message))
    } else {
      this.returnReply(reply)
    }
    reply = parseData(this, data)
  }
}

/**
 * Reset the parser values to the initial state
 *
 * @returns {undefined}
 */
HiredisReplyParser.prototype.reset = function () {
  this.reader = new hiredis.Reader(this.options)
}

module.exports = HiredisReplyParser

},{"../lib/parserError":9,"../lib/replyError":11,"hiredis":3}],8:[function(require,module,exports){
'use strict'

var StringDecoder = require('string_decoder').StringDecoder
var decoder = new StringDecoder()
var ReplyError = require('./replyError')
var ParserError = require('./parserError')
var bufferPool = bufferAlloc(32 * 1024)
var bufferOffset = 0
var interval = null
var counter = 0
var notDecreased = 0
var isModern = typeof Buffer.allocUnsafe === 'function'

/**
 * For backwards compatibility
 * @param len
 * @returns {Buffer}
 */

function bufferAlloc (len) {
  return isModern ? Buffer.allocUnsafe(len) : new Buffer(len)
}

/**
 * Used for lengths and numbers only, faster perf on arrays / bulks
 * @param parser
 * @returns {*}
 */
function parseSimpleNumbers (parser) {
  var offset = parser.offset
  var length = parser.buffer.length - 1
  var number = 0
  var sign = 1

  if (parser.buffer[offset] === 45) {
    sign = -1
    offset++
  }

  while (offset < length) {
    var c1 = parser.buffer[offset++]
    if (c1 === 13) { // \r\n
      parser.offset = offset + 1
      return sign * number
    }
    number = (number * 10) + (c1 - 48)
  }
}

/**
 * Used for integer numbers in case of the returnNumbers option
 *
 * The maximimum possible integer to use is: Math.floor(Number.MAX_SAFE_INTEGER / 10)
 * Staying in a SMI Math.floor((Math.pow(2, 32) / 10) - 1) is even more efficient though
 *
 * @param parser
 * @returns {*}
 */
function parseStringNumbers (parser) {
  var offset = parser.offset
  var length = parser.buffer.length - 1
  var number = 0
  var res = ''

  if (parser.buffer[offset] === 45) {
    res += '-'
    offset++
  }

  while (offset < length) {
    var c1 = parser.buffer[offset++]
    if (c1 === 13) { // \r\n
      parser.offset = offset + 1
      if (number !== 0) {
        res += number
      }
      return res
    } else if (number > 429496728) {
      res += (number * 10) + (c1 - 48)
      number = 0
    } else if (c1 === 48 && number === 0) {
      res += 0
    } else {
      number = (number * 10) + (c1 - 48)
    }
  }
}

/**
 * Returns a string or buffer of the provided offset start and
 * end ranges. Checks `optionReturnBuffers`.
 *
 * If returnBuffers is active, all return values are returned as buffers besides numbers and errors
 *
 * @param parser
 * @param start
 * @param end
 * @returns {*}
 */
function convertBufferRange (parser, start, end) {
  parser.offset = end + 2
  if (parser.optionReturnBuffers === true) {
    return parser.buffer.slice(start, end)
  }

  return parser.buffer.toString('utf-8', start, end)
}

/**
 * Parse a '+' redis simple string response but forward the offsets
 * onto convertBufferRange to generate a string.
 * @param parser
 * @returns {*}
 */
function parseSimpleString (parser) {
  var start = parser.offset
  var offset = start
  var buffer = parser.buffer
  var length = buffer.length - 1

  while (offset < length) {
    if (buffer[offset++] === 13) { // \r\n
      return convertBufferRange(parser, start, offset - 1)
    }
  }
}

/**
 * Returns the string length via parseSimpleNumbers
 * @param parser
 * @returns {*}
 */
function parseLength (parser) {
  var string = parseSimpleNumbers(parser)
  if (string !== undefined) {
    return string
  }
}

/**
 * Parse a ':' redis integer response
 *
 * If stringNumbers is activated the parser always returns numbers as string
 * This is important for big numbers (number > Math.pow(2, 53)) as js numbers
 * are 64bit floating point numbers with reduced precision
 *
 * @param parser
 * @returns {*}
 */
function parseInteger (parser) {
  if (parser.optionStringNumbers) {
    return parseStringNumbers(parser)
  }
  return parseSimpleNumbers(parser)
}

/**
 * Parse a '$' redis bulk string response
 * @param parser
 * @returns {*}
 */
function parseBulkString (parser) {
  var length = parseLength(parser)
  if (length === undefined) {
    return
  }
  if (length === -1) {
    return null
  }
  var offsetEnd = parser.offset + length
  if (offsetEnd + 2 > parser.buffer.length) {
    parser.bigStrSize = offsetEnd + 2
    parser.bigOffset = parser.offset
    parser.totalChunkSize = parser.buffer.length
    parser.bufferCache.push(parser.buffer)
    return
  }

  return convertBufferRange(parser, parser.offset, offsetEnd)
}

/**
 * Parse a '-' redis error response
 * @param parser
 * @returns {Error}
 */
function parseError (parser) {
  var string = parseSimpleString(parser)
  if (string !== undefined) {
    if (parser.optionReturnBuffers === true) {
      string = string.toString()
    }
    return new ReplyError(string)
  }
}

/**
 * Parsing error handler, resets parser buffer
 * @param parser
 * @param error
 */
function handleError (parser, error) {
  parser.buffer = null
  parser.returnFatalError(error)
}

/**
 * Parse a '*' redis array response
 * @param parser
 * @returns {*}
 */
function parseArray (parser) {
  var length = parseLength(parser)
  if (length === undefined) {
    return
  }
  if (length === -1) {
    return null
  }
  var responses = new Array(length)
  return parseArrayElements(parser, responses, 0)
}

/**
 * Push a partly parsed array to the stack
 *
 * @param parser
 * @param elem
 * @param i
 * @returns {undefined}
 */
function pushArrayCache (parser, elem, pos) {
  parser.arrayCache.push(elem)
  parser.arrayPos.push(pos)
}

/**
 * Parse chunked redis array response
 * @param parser
 * @returns {*}
 */
function parseArrayChunks (parser) {
  var tmp = parser.arrayCache.pop()
  var pos = parser.arrayPos.pop()
  if (parser.arrayCache.length) {
    var res = parseArrayChunks(parser)
    if (!res) {
      pushArrayCache(parser, tmp, pos)
      return
    }
    tmp[pos++] = res
  }
  return parseArrayElements(parser, tmp, pos)
}

/**
 * Parse redis array response elements
 * @param parser
 * @param responses
 * @param i
 * @returns {*}
 */
function parseArrayElements (parser, responses, i) {
  var bufferLength = parser.buffer.length
  while (i < responses.length) {
    var offset = parser.offset
    if (parser.offset >= bufferLength) {
      pushArrayCache(parser, responses, i)
      return
    }
    var response = parseType(parser, parser.buffer[parser.offset++])
    if (response === undefined) {
      if (!parser.arrayCache.length) {
        parser.offset = offset
      }
      pushArrayCache(parser, responses, i)
      return
    }
    responses[i] = response
    i++
  }

  return responses
}

/**
 * Called the appropriate parser for the specified type.
 * @param parser
 * @param type
 * @returns {*}
 */
function parseType (parser, type) {
  switch (type) {
    case 36: // $
      return parseBulkString(parser)
    case 58: // :
      return parseInteger(parser)
    case 43: // +
      return parseSimpleString(parser)
    case 42: // *
      return parseArray(parser)
    case 45: // -
      return parseError(parser)
    default:
      return handleError(parser, new ParserError(
        'Protocol error, got ' + JSON.stringify(String.fromCharCode(type)) + ' as reply type byte',
        JSON.stringify(parser.buffer),
        parser.offset
      ))
  }
}

// All allowed options including their typeof value
var optionTypes = {
  returnError: 'function',
  returnFatalError: 'function',
  returnReply: 'function',
  returnBuffers: 'boolean',
  stringNumbers: 'boolean',
  name: 'string'
}

/**
 * Javascript Redis Parser
 * @param options
 * @constructor
 */
function JavascriptRedisParser (options) {
  if (!(this instanceof JavascriptRedisParser)) {
    return new JavascriptRedisParser(options)
  }
  if (!options || !options.returnError || !options.returnReply) {
    throw new TypeError('Please provide all return functions while initiating the parser')
  }
  for (var key in options) {
    // eslint-disable-next-line valid-typeof
    if (optionTypes.hasOwnProperty(key) && typeof options[key] !== optionTypes[key]) {
      throw new TypeError('The options argument contains the property "' + key + '" that is either unknown or of a wrong type')
    }
  }
  if (options.name === 'hiredis') {
    /* istanbul ignore next: hiredis is only supported for legacy usage */
    try {
      var Hiredis = require('./hiredis')
      console.error(new TypeError('Using hiredis is discouraged. Please use the faster JS parser by removing the name option.').stack.replace('Error', 'Warning'))
      return new Hiredis(options)
    } catch (e) {
      console.error(new TypeError('Hiredis is not installed. Please remove the `name` option. The (faster) JS parser is used instead.').stack.replace('Error', 'Warning'))
    }
  }
  this.optionReturnBuffers = !!options.returnBuffers
  this.optionStringNumbers = !!options.stringNumbers
  this.returnError = options.returnError
  this.returnFatalError = options.returnFatalError || options.returnError
  this.returnReply = options.returnReply
  this.name = 'javascript'
  this.reset()
}

/**
 * Reset the parser values to the initial state
 *
 * @returns {undefined}
 */
JavascriptRedisParser.prototype.reset = function () {
  this.offset = 0
  this.buffer = null
  this.bigStrSize = 0
  this.bigOffset = 0
  this.totalChunkSize = 0
  this.bufferCache = []
  this.arrayCache = []
  this.arrayPos = []
}

/**
 * Set the returnBuffers option
 *
 * @param returnBuffers
 * @returns {undefined}
 */
JavascriptRedisParser.prototype.setReturnBuffers = function (returnBuffers) {
  if (typeof returnBuffers !== 'boolean') {
    throw new TypeError('The returnBuffers argument has to be a boolean')
  }
  this.optionReturnBuffers = returnBuffers
}

/**
 * Set the stringNumbers option
 *
 * @param stringNumbers
 * @returns {undefined}
 */
JavascriptRedisParser.prototype.setStringNumbers = function (stringNumbers) {
  if (typeof stringNumbers !== 'boolean') {
    throw new TypeError('The stringNumbers argument has to be a boolean')
  }
  this.optionStringNumbers = stringNumbers
}

/**
 * Decrease the bufferPool size over time
 * @returns {undefined}
 */
function decreaseBufferPool () {
  if (bufferPool.length > 50 * 1024) {
    // Balance between increasing and decreasing the bufferPool
    if (counter === 1 || notDecreased > counter * 2) {
      // Decrease the bufferPool by 10% by removing the first 10% of the current pool
      var sliceLength = Math.floor(bufferPool.length / 10)
      if (bufferOffset <= sliceLength) {
        bufferOffset = 0
      } else {
        bufferOffset -= sliceLength
      }
      bufferPool = bufferPool.slice(sliceLength, bufferPool.length)
    } else {
      notDecreased++
      counter--
    }
  } else {
    clearInterval(interval)
    counter = 0
    notDecreased = 0
    interval = null
  }
}

/**
 * Check if the requested size fits in the current bufferPool.
 * If it does not, reset and increase the bufferPool accordingly.
 *
 * @param length
 * @returns {undefined}
 */
function resizeBuffer (length) {
  if (bufferPool.length < length + bufferOffset) {
    var multiplier = length > 1024 * 1024 * 75 ? 2 : 3
    if (bufferOffset > 1024 * 1024 * 111) {
      bufferOffset = 1024 * 1024 * 50
    }
    bufferPool = bufferAlloc(length * multiplier + bufferOffset)
    bufferOffset = 0
    counter++
    if (interval === null) {
      interval = setInterval(decreaseBufferPool, 50)
    }
  }
}

/**
 * Concat a bulk string containing multiple chunks
 *
 * Notes:
 * 1) The first chunk might contain the whole bulk string including the \r
 * 2) We are only safe to fully add up elements that are neither the first nor any of the last two elements
 *
 * @param parser
 * @returns {String}
 */
function concatBulkString (parser) {
  var list = parser.bufferCache
  var chunks = list.length
  var offset = parser.bigStrSize - parser.totalChunkSize
  parser.offset = offset
  if (offset <= 2) {
    if (chunks === 2) {
      return list[0].toString('utf8', parser.bigOffset, list[0].length + offset - 2)
    }
    chunks--
    offset = list[list.length - 2].length + offset
  }
  var res = decoder.write(list[0].slice(parser.bigOffset))
  for (var i = 1; i < chunks - 1; i++) {
    res += decoder.write(list[i])
  }
  res += decoder.end(list[i].slice(0, offset - 2))
  return res
}

/**
 * Concat the collected chunks from parser.bufferCache.
 *
 * Increases the bufferPool size beforehand if necessary.
 *
 * @param parser
 * @returns {Buffer}
 */
function concatBulkBuffer (parser) {
  var list = parser.bufferCache
  var chunks = list.length
  var length = parser.bigStrSize - parser.bigOffset - 2
  var offset = parser.bigStrSize - parser.totalChunkSize
  parser.offset = offset
  if (offset <= 2) {
    if (chunks === 2) {
      return list[0].slice(parser.bigOffset, list[0].length + offset - 2)
    }
    chunks--
    offset = list[list.length - 2].length + offset
  }
  resizeBuffer(length)
  var start = bufferOffset
  list[0].copy(bufferPool, start, parser.bigOffset, list[0].length)
  bufferOffset += list[0].length - parser.bigOffset
  for (var i = 1; i < chunks - 1; i++) {
    list[i].copy(bufferPool, bufferOffset)
    bufferOffset += list[i].length
  }
  list[i].copy(bufferPool, bufferOffset, 0, offset - 2)
  bufferOffset += offset - 2
  return bufferPool.slice(start, bufferOffset)
}

/**
 * Parse the redis buffer
 * @param buffer
 * @returns {undefined}
 */
JavascriptRedisParser.prototype.execute = function execute (buffer) {
  if (this.buffer === null) {
    this.buffer = buffer
    this.offset = 0
  } else if (this.bigStrSize === 0) {
    var oldLength = this.buffer.length
    var remainingLength = oldLength - this.offset
    var newBuffer = bufferAlloc(remainingLength + buffer.length)
    this.buffer.copy(newBuffer, 0, this.offset, oldLength)
    buffer.copy(newBuffer, remainingLength, 0, buffer.length)
    this.buffer = newBuffer
    this.offset = 0
    if (this.arrayCache.length) {
      var arr = parseArrayChunks(this)
      if (!arr) {
        return
      }
      this.returnReply(arr)
    }
  } else if (this.totalChunkSize + buffer.length >= this.bigStrSize) {
    this.bufferCache.push(buffer)
    var tmp = this.optionReturnBuffers ? concatBulkBuffer(this) : concatBulkString(this)
    this.bigStrSize = 0
    this.bufferCache = []
    this.buffer = buffer
    if (this.arrayCache.length) {
      this.arrayCache[0][this.arrayPos[0]++] = tmp
      tmp = parseArrayChunks(this)
      if (!tmp) {
        return
      }
    }
    this.returnReply(tmp)
  } else {
    this.bufferCache.push(buffer)
    this.totalChunkSize += buffer.length
    return
  }

  while (this.offset < this.buffer.length) {
    var offset = this.offset
    var type = this.buffer[this.offset++]
    var response = parseType(this, type)
    if (response === undefined) {
      if (!this.arrayCache.length) {
        this.offset = offset
      }
      return
    }

    if (type === 45) {
      this.returnError(response)
    } else {
      this.returnReply(response)
    }
  }

  this.buffer = null
}

module.exports = JavascriptRedisParser

},{"./hiredis":7,"./parserError":9,"./replyError":11,"string_decoder":undefined}],9:[function(require,module,exports){
'use strict'

var util = require('util')
var assert = require('assert')
var RedisError = require('./redisError')
var ADD_STACKTRACE = false

function ParserError (message, buffer, offset) {
  assert(buffer)
  assert.strictEqual(typeof offset, 'number')
  RedisError.call(this, message, ADD_STACKTRACE)
  this.offset = offset
  this.buffer = buffer
  Error.captureStackTrace(this, ParserError)
}

util.inherits(ParserError, RedisError)

Object.defineProperty(ParserError.prototype, 'name', {
  value: 'ParserError',
  configurable: true,
  writable: true
})

module.exports = ParserError

},{"./redisError":10,"assert":undefined,"util":undefined}],10:[function(require,module,exports){
'use strict'

var util = require('util')

function RedisError (message, stack) {
  Object.defineProperty(this, 'message', {
    value: message || '',
    configurable: true,
    writable: true
  })
  if (stack || stack === undefined) {
    Error.captureStackTrace(this, RedisError)
  }
}

util.inherits(RedisError, Error)

Object.defineProperty(RedisError.prototype, 'name', {
  value: 'RedisError',
  configurable: true,
  writable: true
})

module.exports = RedisError

},{"util":undefined}],11:[function(require,module,exports){
'use strict'

var util = require('util')
var RedisError = require('./redisError')
var ADD_STACKTRACE = false

function ReplyError (message) {
  var tmp = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  RedisError.call(this, message, ADD_STACKTRACE)
  Error.captureStackTrace(this, ReplyError)
  Error.stackTraceLimit = tmp
}

util.inherits(ReplyError, RedisError)

Object.defineProperty(ReplyError.prototype, 'name', {
  value: 'ReplyError',
  configurable: true,
  writable: true
})

module.exports = ReplyError

},{"./redisError":10,"util":undefined}],12:[function(require,module,exports){
'use strict';

var net = require('net');
var tls = require('tls');
var util = require('util');
var utils = require('./lib/utils');
var Command = require('./lib/command');
var Queue = require('double-ended-queue');
var errorClasses = require('./lib/customErrors');
var EventEmitter = require('events');
var Parser = require('redis-parser');
var commands = require('redis-commands');
var debug = require('./lib/debug');
var unifyOptions = require('./lib/createClient');
var SUBSCRIBE_COMMANDS = {
    subscribe: true,
    unsubscribe: true,
    psubscribe: true,
    punsubscribe: true
};

// Newer Node.js versions > 0.10 return the EventEmitter right away and using .EventEmitter was deprecated
if (typeof EventEmitter !== 'function') {
    EventEmitter = EventEmitter.EventEmitter;
}

function noop () {}

function handle_detect_buffers_reply (reply, command, buffer_args) {
    if (buffer_args === false || this.message_buffers) {
        // If detect_buffers option was specified, then the reply from the parser will be a buffer.
        // If this command did not use Buffer arguments, then convert the reply to Strings here.
        reply = utils.reply_to_strings(reply);
    }

    if (command === 'hgetall') {
        reply = utils.reply_to_object(reply);
    }
    return reply;
}

exports.debug_mode = /\bredis\b/i.test(process.env.NODE_DEBUG);

// Attention: The second parameter might be removed at will and is not officially supported.
// Do not rely on this
function RedisClient (options, stream) {
    // Copy the options so they are not mutated
    options = utils.clone(options);
    EventEmitter.call(this);
    var cnx_options = {};
    var self = this;
    /* istanbul ignore next: travis does not work with stunnel atm. Therefore the tls tests are skipped on travis */
    for (var tls_option in options.tls) {
        cnx_options[tls_option] = options.tls[tls_option];
        // Copy the tls options into the general options to make sure the address is set right
        if (tls_option === 'port' || tls_option === 'host' || tls_option === 'path' || tls_option === 'family') {
            options[tls_option] = options.tls[tls_option];
        }
    }
    if (stream) {
        // The stream from the outside is used so no connection from this side is triggered but from the server this client should talk to
        // Reconnect etc won't work with this. This requires monkey patching to work, so it is not officially supported
        options.stream = stream;
        this.address = '"Private stream"';
    } else if (options.path) {
        cnx_options.path = options.path;
        this.address = options.path;
    } else {
        cnx_options.port = +options.port || 6379;
        cnx_options.host = options.host || '127.0.0.1';
        cnx_options.family = (!options.family && net.isIP(cnx_options.host)) || (options.family === 'IPv6' ? 6 : 4);
        this.address = cnx_options.host + ':' + cnx_options.port;
    }
    // Warn on misusing deprecated functions
    if (typeof options.retry_strategy === 'function') {
        if ('max_attempts' in options) {
            self.warn('WARNING: You activated the retry_strategy and max_attempts at the same time. This is not possible and max_attempts will be ignored.');
            // Do not print deprecation warnings twice
            delete options.max_attempts;
        }
        if ('retry_max_delay' in options) {
            self.warn('WARNING: You activated the retry_strategy and retry_max_delay at the same time. This is not possible and retry_max_delay will be ignored.');
            // Do not print deprecation warnings twice
            delete options.retry_max_delay;
        }
    }

    this.connection_options = cnx_options;
    this.connection_id = RedisClient.connection_id++;
    this.connected = false;
    this.ready = false;
    if (options.socket_nodelay === undefined) {
        options.socket_nodelay = true;
    } else if (!options.socket_nodelay) { // Only warn users with this set to false
        self.warn(
            'socket_nodelay is deprecated and will be removed in v.3.0.0.\n' +
            'Setting socket_nodelay to false likely results in a reduced throughput. Please use .batch for pipelining instead.\n' +
            'If you are sure you rely on the NAGLE-algorithm you can activate it by calling client.stream.setNoDelay(false) instead.'
        );
    }
    if (options.socket_keepalive === undefined) {
        options.socket_keepalive = true;
    }
    for (var command in options.rename_commands) {
        options.rename_commands[command.toLowerCase()] = options.rename_commands[command];
    }
    options.return_buffers = !!options.return_buffers;
    options.detect_buffers = !!options.detect_buffers;
    // Override the detect_buffers setting if return_buffers is active and print a warning
    if (options.return_buffers && options.detect_buffers) {
        self.warn('WARNING: You activated return_buffers and detect_buffers at the same time. The return value is always going to be a buffer.');
        options.detect_buffers = false;
    }
    if (options.detect_buffers) {
        // We only need to look at the arguments if we do not know what we have to return
        this.handle_reply = handle_detect_buffers_reply;
    }
    this.should_buffer = false;
    this.max_attempts = options.max_attempts | 0;
    if ('max_attempts' in options) {
        self.warn(
            'max_attempts is deprecated and will be removed in v.3.0.0.\n' +
            'To reduce the amount of options and the improve the reconnection handling please use the new `retry_strategy` option instead.\n' +
            'This replaces the max_attempts and retry_max_delay option.'
        );
    }
    this.command_queue = new Queue(); // Holds sent commands to de-pipeline them
    this.offline_queue = new Queue(); // Holds commands issued but not able to be sent
    this.pipeline_queue = new Queue(); // Holds all pipelined commands
    // ATTENTION: connect_timeout should change in v.3.0 so it does not count towards ending reconnection attempts after x seconds
    // This should be done by the retry_strategy. Instead it should only be the timeout for connecting to redis
    this.connect_timeout = +options.connect_timeout || 3600000; // 60 * 60 * 1000 ms
    this.enable_offline_queue = options.enable_offline_queue === false ? false : true;
    this.retry_max_delay = +options.retry_max_delay || null;
    if ('retry_max_delay' in options) {
        self.warn(
            'retry_max_delay is deprecated and will be removed in v.3.0.0.\n' +
            'To reduce the amount of options and the improve the reconnection handling please use the new `retry_strategy` option instead.\n' +
            'This replaces the max_attempts and retry_max_delay option.'
        );
    }
    this.initialize_retry_vars();
    this.pub_sub_mode = 0;
    this.subscription_set = {};
    this.monitoring = false;
    this.message_buffers = false;
    this.closing = false;
    this.server_info = {};
    this.auth_pass = options.auth_pass || options.password;
    this.selected_db = options.db; // Save the selected db here, used when reconnecting
    this.old_state = null;
    this.fire_strings = true; // Determine if strings or buffers should be written to the stream
    this.pipeline = false;
    this.sub_commands_left = 0;
    this.times_connected = 0;
    this.buffers = options.return_buffers || options.detect_buffers;
    this.options = options;
    this.reply = 'ON'; // Returning replies is the default
    this.create_stream();
    // The listeners will not be attached right away, so let's print the deprecation message while the listener is attached
    this.on('newListener', function (event) {
        if (event === 'idle') {
            this.warn(
                'The idle event listener is deprecated and will likely be removed in v.3.0.0.\n' +
                'If you rely on this feature please open a new ticket in node_redis with your use case'
            );
        } else if (event === 'drain') {
            this.warn(
                'The drain event listener is deprecated and will be removed in v.3.0.0.\n' +
                'If you want to keep on listening to this event please listen to the stream drain event directly.'
            );
        } else if ((event === 'message_buffer' || event === 'pmessage_buffer' || event === 'messageBuffer' || event === 'pmessageBuffer') && !this.buffers && !this.message_buffers) {
            if (this.reply_parser.name !== 'javascript') {
                return this.warn(
                    'You attached the "' + event + '" listener without the returnBuffers option set to true.\n' +
                    'Please use the JavaScript parser or set the returnBuffers option to true to return buffers.'
                );
            }
            this.reply_parser.optionReturnBuffers = true;
            this.message_buffers = true;
            this.handle_reply = handle_detect_buffers_reply;
        }
    });
}
util.inherits(RedisClient, EventEmitter);

RedisClient.connection_id = 0;

function create_parser (self) {
    return new Parser({
        returnReply: function (data) {
            self.return_reply(data);
        },
        returnError: function (err) {
            // Return a ReplyError to indicate Redis returned an error
            self.return_error(err);
        },
        returnFatalError: function (err) {
            // Error out all fired commands. Otherwise they might rely on faulty data. We have to reconnect to get in a working state again
            // Note: the execution order is important. First flush and emit, then create the stream
            err.message += '. Please report this.';
            self.ready = false;
            self.flush_and_error({
                message: 'Fatal error encountert. Command aborted.',
                code: 'NR_FATAL'
            }, {
                error: err,
                queues: ['command_queue']
            });
            self.emit('error', err);
            self.create_stream();
        },
        returnBuffers: self.buffers || self.message_buffers,
        name: self.options.parser || 'javascript',
        stringNumbers: self.options.string_numbers || false
    });
}

/******************************************************************************

    All functions in here are internal besides the RedisClient constructor
    and the exported functions. Don't rely on them as they will be private
    functions in node_redis v.3

******************************************************************************/

// Attention: the function name "create_stream" should not be changed, as other libraries need this to mock the stream (e.g. fakeredis)
RedisClient.prototype.create_stream = function () {
    var self = this;

    // Init parser
    this.reply_parser = create_parser(this);

    if (this.options.stream) {
        // Only add the listeners once in case of a reconnect try (that won't work)
        if (this.stream) {
            return;
        }
        this.stream = this.options.stream;
    } else {
        // On a reconnect destroy the former stream and retry
        if (this.stream) {
            this.stream.removeAllListeners();
            this.stream.destroy();
        }

        /* istanbul ignore if: travis does not work with stunnel atm. Therefore the tls tests are skipped on travis */
        if (this.options.tls) {
            this.stream = tls.connect(this.connection_options);
        } else {
            this.stream = net.createConnection(this.connection_options);
        }
    }

    if (this.options.connect_timeout) {
        this.stream.setTimeout(this.connect_timeout, function () {
            // Note: This is only tested if a internet connection is established
            self.retry_totaltime = self.connect_timeout;
            self.connection_gone('timeout');
        });
    }

    /* istanbul ignore next: travis does not work with stunnel atm. Therefore the tls tests are skipped on travis */
    var connect_event = this.options.tls ? 'secureConnect' : 'connect';
    this.stream.once(connect_event, function () {
        this.removeAllListeners('timeout');
        self.times_connected++;
        self.on_connect();
    });

    this.stream.on('data', function (buffer_from_socket) {
        // The buffer_from_socket.toString() has a significant impact on big chunks and therefore this should only be used if necessary
        debug('Net read ' + self.address + ' id ' + self.connection_id); // + ': ' + buffer_from_socket.toString());
        self.reply_parser.execute(buffer_from_socket);
        self.emit_idle();
    });

    this.stream.on('error', function (err) {
        self.on_error(err);
    });

    /* istanbul ignore next: difficult to test and not important as long as we keep this listener */
    this.stream.on('clientError', function (err) {
        debug('clientError occured');
        self.on_error(err);
    });

    this.stream.once('close', function (hadError) {
        self.connection_gone('close');
    });

    this.stream.once('end', function () {
        self.connection_gone('end');
    });

    this.stream.on('drain', function () {
        self.drain();
    });

    if (this.options.socket_nodelay) {
        this.stream.setNoDelay();
    }

    // Fire the command before redis is connected to be sure it's the first fired command
    if (this.auth_pass !== undefined) {
        this.ready = true;
        this.auth(this.auth_pass);
        this.ready = false;
    }
};

RedisClient.prototype.handle_reply = function (reply, command) {
    if (command === 'hgetall') {
        reply = utils.reply_to_object(reply);
    }
    return reply;
};

RedisClient.prototype.cork = noop;
RedisClient.prototype.uncork = noop;

RedisClient.prototype.initialize_retry_vars = function () {
    this.retry_timer = null;
    this.retry_totaltime = 0;
    this.retry_delay = 200;
    this.retry_backoff = 1.7;
    this.attempts = 1;
};

RedisClient.prototype.warn = function (msg) {
    var self = this;
    // Warn on the next tick. Otherwise no event listener can be added
    // for warnings that are emitted in the redis client constructor
    process.nextTick(function () {
        if (self.listeners('warning').length !== 0) {
            self.emit('warning', msg);
        } else {
            console.warn('node_redis:', msg);
        }
    });
};

// Flush provided queues, erroring any items with a callback first
RedisClient.prototype.flush_and_error = function (error_attributes, options) {
    options = options || {};
    var aggregated_errors = [];
    var queue_names = options.queues || ['command_queue', 'offline_queue']; // Flush the command_queue first to keep the order intakt
    for (var i = 0; i < queue_names.length; i++) {
        // If the command was fired it might have been processed so far
        if (queue_names[i] === 'command_queue') {
            error_attributes.message += ' It might have been processed.';
        } else { // As the command_queue is flushed first, remove this for the offline queue
            error_attributes.message = error_attributes.message.replace(' It might have been processed.', '');
        }
        // Don't flush everything from the queue
        for (var command_obj = this[queue_names[i]].shift(); command_obj; command_obj = this[queue_names[i]].shift()) {
            var err = new errorClasses.AbortError(error_attributes);
            if (command_obj.error) {
                err.stack = err.stack + command_obj.error.stack.replace(/^Error.*?\n/, '\n');
            }
            err.command = command_obj.command.toUpperCase();
            if (command_obj.args && command_obj.args.length) {
                err.args = command_obj.args;
            }
            if (options.error) {
                err.origin = options.error;
            }
            if (typeof command_obj.callback === 'function') {
                command_obj.callback(err);
            } else {
                aggregated_errors.push(err);
            }
        }
    }
    // Currently this would be a breaking change, therefore it's only emitted in debug_mode
    if (exports.debug_mode && aggregated_errors.length) {
        var error;
        if (aggregated_errors.length === 1) {
            error = aggregated_errors[0];
        } else {
            error_attributes.message = error_attributes.message.replace('It', 'They').replace(/command/i, '$&s');
            error = new errorClasses.AggregateError(error_attributes);
            error.errors = aggregated_errors;
        }
        this.emit('error', error);
    }
};

RedisClient.prototype.on_error = function (err) {
    if (this.closing) {
        return;
    }

    err.message = 'Redis connection to ' + this.address + ' failed - ' + err.message;
    debug(err.message);
    this.connected = false;
    this.ready = false;

    // Only emit the error if the retry_stategy option is not set
    if (!this.options.retry_strategy) {
        this.emit('error', err);
    }
    // 'error' events get turned into exceptions if they aren't listened for. If the user handled this error
    // then we should try to reconnect.
    this.connection_gone('error', err);
};

RedisClient.prototype.on_connect = function () {
    debug('Stream connected ' + this.address + ' id ' + this.connection_id);

    this.connected = true;
    this.ready = false;
    this.emitted_end = false;
    this.stream.setKeepAlive(this.options.socket_keepalive);
    this.stream.setTimeout(0);

    this.emit('connect');
    this.initialize_retry_vars();

    if (this.options.no_ready_check) {
        this.on_ready();
    } else {
        this.ready_check();
    }
};

RedisClient.prototype.on_ready = function () {
    var self = this;

    debug('on_ready called ' + this.address + ' id ' + this.connection_id);
    this.ready = true;

    this.cork = function () {
        self.pipeline = true;
        if (self.stream.cork) {
            self.stream.cork();
        }
    };
    this.uncork = function () {
        if (self.fire_strings) {
            self.write_strings();
        } else {
            self.write_buffers();
        }
        self.pipeline = false;
        self.fire_strings = true;
        if (self.stream.uncork) {
            // TODO: Consider using next tick here. See https://github.com/NodeRedis/node_redis/issues/1033
            self.stream.uncork();
        }
    };

    // Restore modal commands from previous connection. The order of the commands is important
    if (this.selected_db !== undefined) {
        this.internal_send_command(new Command('select', [this.selected_db]));
    }
    if (this.monitoring) { // Monitor has to be fired before pub sub commands
        this.internal_send_command(new Command('monitor', []));
    }
    var callback_count = Object.keys(this.subscription_set).length;
    if (!this.options.disable_resubscribing && callback_count) {
        // only emit 'ready' when all subscriptions were made again
        // TODO: Remove the countdown for ready here. This is not coherent with all other modes and should therefore not be handled special
        // We know we are ready as soon as all commands were fired
        var callback = function () {
            callback_count--;
            if (callback_count === 0) {
                self.emit('ready');
            }
        };
        debug('Sending pub/sub on_ready commands');
        for (var key in this.subscription_set) {
            var command = key.slice(0, key.indexOf('_'));
            var args = this.subscription_set[key];
            this[command]([args], callback);
        }
        this.send_offline_queue();
        return;
    }
    this.send_offline_queue();
    this.emit('ready');
};

RedisClient.prototype.on_info_cmd = function (err, res) {
    if (err) {
        if (err.message === "ERR unknown command 'info'") {
            this.on_ready();
            return;
        }
        err.message = 'Ready check failed: ' + err.message;
        this.emit('error', err);
        return;
    }

    /* istanbul ignore if: some servers might not respond with any info data. This is just a safety check that is difficult to test */
    if (!res) {
        debug('The info command returned without any data.');
        this.on_ready();
        return;
    }

    if (!this.server_info.loading || this.server_info.loading === '0') {
        // If the master_link_status exists but the link is not up, try again after 50 ms
        if (this.server_info.master_link_status && this.server_info.master_link_status !== 'up') {
            this.server_info.loading_eta_seconds = 0.05;
        } else {
            // Eta loading should change
            debug('Redis server ready.');
            this.on_ready();
            return;
        }
    }

    var retry_time = +this.server_info.loading_eta_seconds * 1000;
    if (retry_time > 1000) {
        retry_time = 1000;
    }
    debug('Redis server still loading, trying again in ' + retry_time);
    setTimeout(function (self) {
        self.ready_check();
    }, retry_time, this);
};

RedisClient.prototype.ready_check = function () {
    var self = this;
    debug('Checking server ready state...');
    // Always fire this info command as first command even if other commands are already queued up
    this.ready = true;
    this.info(function (err, res) {
        self.on_info_cmd(err, res);
    });
    this.ready = false;
};

RedisClient.prototype.send_offline_queue = function () {
    for (var command_obj = this.offline_queue.shift(); command_obj; command_obj = this.offline_queue.shift()) {
        debug('Sending offline command: ' + command_obj.command);
        this.internal_send_command(command_obj);
    }
    this.drain();
};

var retry_connection = function (self, error) {
    debug('Retrying connection...');

    var reconnect_params = {
        delay: self.retry_delay,
        attempt: self.attempts,
        error: error
    };
    if (self.options.camel_case) {
        reconnect_params.totalRetryTime = self.retry_totaltime;
        reconnect_params.timesConnected = self.times_connected;
    } else {
        reconnect_params.total_retry_time = self.retry_totaltime;
        reconnect_params.times_connected = self.times_connected;
    }
    self.emit('reconnecting', reconnect_params);

    self.retry_totaltime += self.retry_delay;
    self.attempts += 1;
    self.retry_delay = Math.round(self.retry_delay * self.retry_backoff);
    self.create_stream();
    self.retry_timer = null;
};

RedisClient.prototype.connection_gone = function (why, error) {
    // If a retry is already in progress, just let that happen
    if (this.retry_timer) {
        return;
    }
    error = error || null;

    debug('Redis connection is gone from ' + why + ' event.');
    this.connected = false;
    this.ready = false;
    // Deactivate cork to work with the offline queue
    this.cork = noop;
    this.uncork = noop;
    this.pipeline = false;
    this.pub_sub_mode = 0;

    // since we are collapsing end and close, users don't expect to be called twice
    if (!this.emitted_end) {
        this.emit('end');
        this.emitted_end = true;
    }

    // If this is a requested shutdown, then don't retry
    if (this.closing) {
        debug('Connection ended by quit / end command, not retrying.');
        this.flush_and_error({
            message: 'Stream connection ended and command aborted.',
            code: 'NR_CLOSED'
        }, {
            error: error
        });
        return;
    }

    if (typeof this.options.retry_strategy === 'function') {
        var retry_params = {
            attempt: this.attempts,
            error: error
        };
        if (this.options.camel_case) {
            retry_params.totalRetryTime = this.retry_totaltime;
            retry_params.timesConnected = this.times_connected;
        } else {
            retry_params.total_retry_time = this.retry_totaltime;
            retry_params.times_connected = this.times_connected;
        }
        this.retry_delay = this.options.retry_strategy(retry_params);
        if (typeof this.retry_delay !== 'number') {
            // Pass individual error through
            if (this.retry_delay instanceof Error) {
                error = this.retry_delay;
            }
            this.flush_and_error({
                message: 'Stream connection ended and command aborted.',
                code: 'NR_CLOSED'
            }, {
                error: error
            });
            this.end(false);
            return;
        }
    }

    if (this.max_attempts !== 0 && this.attempts >= this.max_attempts || this.retry_totaltime >= this.connect_timeout) {
        var message = 'Redis connection in broken state: ';
        if (this.retry_totaltime >= this.connect_timeout) {
            message += 'connection timeout exceeded.';
        } else {
            message += 'maximum connection attempts exceeded.';
        }

        this.flush_and_error({
            message: message,
            code: 'CONNECTION_BROKEN',
        }, {
            error: error
        });
        var err = new Error(message);
        err.code = 'CONNECTION_BROKEN';
        if (error) {
            err.origin = error;
        }
        this.emit('error', err);
        this.end(false);
        return;
    }

    // Retry commands after a reconnect instead of throwing an error. Use this with caution
    if (this.options.retry_unfulfilled_commands) {
        this.offline_queue.unshift.apply(this.offline_queue, this.command_queue.toArray());
        this.command_queue.clear();
    } else if (this.command_queue.length !== 0) {
        this.flush_and_error({
            message: 'Redis connection lost and command aborted.',
            code: 'UNCERTAIN_STATE'
        }, {
            error: error,
            queues: ['command_queue']
        });
    }

    if (this.retry_max_delay !== null && this.retry_delay > this.retry_max_delay) {
        this.retry_delay = this.retry_max_delay;
    } else if (this.retry_totaltime + this.retry_delay > this.connect_timeout) {
        // Do not exceed the maximum
        this.retry_delay = this.connect_timeout - this.retry_totaltime;
    }

    debug('Retry connection in ' + this.retry_delay + ' ms');

    this.retry_timer = setTimeout(retry_connection, this.retry_delay, this, error);
};

RedisClient.prototype.return_error = function (err) {
    var command_obj = this.command_queue.shift();
    if (command_obj.error) {
        err.stack = command_obj.error.stack.replace(/^Error.*?\n/, 'ReplyError: ' + err.message + '\n');
    }
    err.command = command_obj.command.toUpperCase();
    if (command_obj.args && command_obj.args.length) {
        err.args = command_obj.args;
    }

    // Count down pub sub mode if in entering modus
    if (this.pub_sub_mode > 1) {
        this.pub_sub_mode--;
    }

    var match = err.message.match(utils.err_code);
    // LUA script could return user errors that don't behave like all other errors!
    if (match) {
        err.code = match[1];
    }

    utils.callback_or_emit(this, command_obj.callback, err);
};

RedisClient.prototype.drain = function () {
    this.emit('drain');
    this.should_buffer = false;
};

RedisClient.prototype.emit_idle = function () {
    if (this.command_queue.length === 0 && this.pub_sub_mode === 0) {
        this.emit('idle');
    }
};

function normal_reply (self, reply) {
    var command_obj = self.command_queue.shift();
    if (typeof command_obj.callback === 'function') {
        if (command_obj.command !== 'exec') {
            reply = self.handle_reply(reply, command_obj.command, command_obj.buffer_args);
        }
        command_obj.callback(null, reply);
    } else {
        debug('No callback for reply');
    }
}

function subscribe_unsubscribe (self, reply, type) {
    // Subscribe commands take an optional callback and also emit an event, but only the _last_ response is included in the callback
    // The pub sub commands return each argument in a separate return value and have to be handled that way
    var command_obj = self.command_queue.get(0);
    var buffer = self.options.return_buffers || self.options.detect_buffers && command_obj.buffer_args;
    var channel = (buffer || reply[1] === null) ? reply[1] : reply[1].toString();
    var count = +reply[2]; // Return the channel counter as number no matter if `string_numbers` is activated or not
    debug(type, channel);

    // Emit first, then return the callback
    if (channel !== null) { // Do not emit or "unsubscribe" something if there was no channel to unsubscribe from
        self.emit(type, channel, count);
        if (type === 'subscribe' || type === 'psubscribe') {
            self.subscription_set[type + '_' + channel] = channel;
        } else {
            type = type === 'unsubscribe' ? 'subscribe' : 'psubscribe'; // Make types consistent
            delete self.subscription_set[type + '_' + channel];
        }
    }

    if (command_obj.args.length === 1 || self.sub_commands_left === 1 || command_obj.args.length === 0 && (count === 0 || channel === null)) {
        if (count === 0) { // unsubscribed from all channels
            var running_command;
            var i = 1;
            self.pub_sub_mode = 0; // Deactivating pub sub mode
            // This should be a rare case and therefore handling it this way should be good performance wise for the general case
            while (running_command = self.command_queue.get(i)) {
                if (SUBSCRIBE_COMMANDS[running_command.command]) {
                    self.pub_sub_mode = i; // Entering pub sub mode again
                    break;
                }
                i++;
            }
        }
        self.command_queue.shift();
        if (typeof command_obj.callback === 'function') {
            // TODO: The current return value is pretty useless.
            // Evaluate to change this in v.3 to return all subscribed / unsubscribed channels in an array including the number of channels subscribed too
            command_obj.callback(null, channel);
        }
        self.sub_commands_left = 0;
    } else {
        if (self.sub_commands_left !== 0) {
            self.sub_commands_left--;
        } else {
            self.sub_commands_left = command_obj.args.length ? command_obj.args.length - 1 : count;
        }
    }
}

function return_pub_sub (self, reply) {
    var type = reply[0].toString();
    if (type === 'message') { // channel, message
        if (!self.options.return_buffers || self.message_buffers) { // backwards compatible. Refactor this in v.3 to always return a string on the normal emitter
            self.emit('message', reply[1].toString(), reply[2].toString());
            self.emit('message_buffer', reply[1], reply[2]);
            self.emit('messageBuffer', reply[1], reply[2]);
        } else {
            self.emit('message', reply[1], reply[2]);
        }
    } else if (type === 'pmessage') { // pattern, channel, message
        if (!self.options.return_buffers || self.message_buffers) { // backwards compatible. Refactor this in v.3 to always return a string on the normal emitter
            self.emit('pmessage', reply[1].toString(), reply[2].toString(), reply[3].toString());
            self.emit('pmessage_buffer', reply[1], reply[2], reply[3]);
            self.emit('pmessageBuffer', reply[1], reply[2], reply[3]);
        } else {
            self.emit('pmessage', reply[1], reply[2], reply[3]);
        }
    } else {
        subscribe_unsubscribe(self, reply, type);
    }
}

RedisClient.prototype.return_reply = function (reply) {
    if (this.monitoring) {
        var replyStr;
        if (this.buffers && Buffer.isBuffer(reply)) {
            replyStr = reply.toString();
        } else {
            replyStr = reply;
        }
        // If in monitor mode, all normal commands are still working and we only want to emit the streamlined commands
        if (typeof replyStr === 'string' && utils.monitor_regex.test(replyStr)) {
            var timestamp = replyStr.slice(0, replyStr.indexOf(' '));
            var args = replyStr.slice(replyStr.indexOf('"') + 1, -1).split('" "').map(function (elem) {
                return elem.replace(/\\"/g, '"');
            });
            this.emit('monitor', timestamp, args, replyStr);
            return;
        }
    }
    if (this.pub_sub_mode === 0) {
        normal_reply(this, reply);
    } else if (this.pub_sub_mode !== 1) {
        this.pub_sub_mode--;
        normal_reply(this, reply);
    } else if (!(reply instanceof Array) || reply.length <= 2) {
        // Only PING and QUIT are allowed in this context besides the pub sub commands
        // Ping replies with ['pong', null|value] and quit with 'OK'
        normal_reply(this, reply);
    } else {
        return_pub_sub(this, reply);
    }
};

function handle_offline_command (self, command_obj) {
    var command = command_obj.command;
    var err, msg;
    if (self.closing || !self.enable_offline_queue) {
        command = command.toUpperCase();
        if (!self.closing) {
            if (self.stream.writable) {
                msg = 'The connection is not yet established and the offline queue is deactivated.';
            } else {
                msg = 'Stream not writeable.';
            }
        } else {
            msg = 'The connection is already closed.';
        }
        err = new errorClasses.AbortError({
            message: command + " can't be processed. " + msg,
            code: 'NR_CLOSED',
            command: command
        });
        if (command_obj.args.length) {
            err.args = command_obj.args;
        }
        utils.reply_in_order(self, command_obj.callback, err);
    } else {
        debug('Queueing ' + command + ' for next server connection.');
        self.offline_queue.push(command_obj);
    }
    self.should_buffer = true;
}

// Do not call internal_send_command directly, if you are not absolutly certain it handles everything properly
// e.g. monitor / info does not work with internal_send_command only
RedisClient.prototype.internal_send_command = function (command_obj) {
    var arg, prefix_keys;
    var i = 0;
    var command_str = '';
    var args = command_obj.args;
    var command = command_obj.command;
    var len = args.length;
    var big_data = false;
    var args_copy = new Array(len);

    if (process.domain && command_obj.callback) {
        command_obj.callback = process.domain.bind(command_obj.callback);
    }

    if (this.ready === false || this.stream.writable === false) {
        // Handle offline commands right away
        handle_offline_command(this, command_obj);
        return false; // Indicate buffering
    }

    for (i = 0; i < len; i += 1) {
        if (typeof args[i] === 'string') {
            // 30000 seemed to be a good value to switch to buffers after testing and checking the pros and cons
            if (args[i].length > 30000) {
                big_data = true;
                args_copy[i] = new Buffer(args[i], 'utf8');
            } else {
                args_copy[i] = args[i];
            }
        } else if (typeof args[i] === 'object') { // Checking for object instead of Buffer.isBuffer helps us finding data types that we can't handle properly
            if (args[i] instanceof Date) { // Accept dates as valid input
                args_copy[i] = args[i].toString();
            } else if (args[i] === null) {
                this.warn(
                    'Deprecated: The ' + command.toUpperCase() + ' command contains a "null" argument.\n' +
                    'This is converted to a "null" string now and will return an error from v.3.0 on.\n' +
                    'Please handle this in your code to make sure everything works as you intended it to.'
                );
                args_copy[i] = 'null'; // Backwards compatible :/
            } else if (Buffer.isBuffer(args[i])) {
                args_copy[i] = args[i];
                command_obj.buffer_args = true;
                big_data = true;
            } else {
                this.warn(
                    'Deprecated: The ' + command.toUpperCase() + ' command contains a argument of type ' + args[i].constructor.name + '.\n' +
                    'This is converted to "' + args[i].toString() + '" by using .toString() now and will return an error from v.3.0 on.\n' +
                    'Please handle this in your code to make sure everything works as you intended it to.'
                );
                args_copy[i] = args[i].toString(); // Backwards compatible :/
            }
        } else if (typeof args[i] === 'undefined') {
            this.warn(
                'Deprecated: The ' + command.toUpperCase() + ' command contains a "undefined" argument.\n' +
                'This is converted to a "undefined" string now and will return an error from v.3.0 on.\n' +
                'Please handle this in your code to make sure everything works as you intended it to.'
            );
            args_copy[i] = 'undefined'; // Backwards compatible :/
        } else {
            // Seems like numbers are converted fast using string concatenation
            args_copy[i] = '' + args[i];
        }
    }

    if (this.options.prefix) {
        prefix_keys = commands.getKeyIndexes(command, args_copy);
        for (i = prefix_keys.pop(); i !== undefined; i = prefix_keys.pop()) {
            args_copy[i] = this.options.prefix + args_copy[i];
        }
    }
    if (this.options.rename_commands && this.options.rename_commands[command]) {
        command = this.options.rename_commands[command];
    }
    // Always use 'Multi bulk commands', but if passed any Buffer args, then do multiple writes, one for each arg.
    // This means that using Buffers in commands is going to be slower, so use Strings if you don't already have a Buffer.
    command_str = '*' + (len + 1) + '\r\n$' + command.length + '\r\n' + command + '\r\n';

    if (big_data === false) { // Build up a string and send entire command in one write
        for (i = 0; i < len; i += 1) {
            arg = args_copy[i];
            command_str += '$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n';
        }
        debug('Send ' + this.address + ' id ' + this.connection_id + ': ' + command_str);
        this.write(command_str);
    } else {
        debug('Send command (' + command_str + ') has Buffer arguments');
        this.fire_strings = false;
        this.write(command_str);

        for (i = 0; i < len; i += 1) {
            arg = args_copy[i];
            if (typeof arg === 'string') {
                this.write('$' + Buffer.byteLength(arg) + '\r\n' + arg + '\r\n');
            } else { // buffer
                this.write('$' + arg.length + '\r\n');
                this.write(arg);
                this.write('\r\n');
            }
            debug('send_command: buffer send ' + arg.length + ' bytes');
        }
    }
    if (command_obj.call_on_write) {
        command_obj.call_on_write();
    }
    // Handle `CLIENT REPLY ON|OFF|SKIP`
    // This has to be checked after call_on_write
    /* istanbul ignore else: TODO: Remove this as soon as we test Redis 3.2 on travis */
    if (this.reply === 'ON') {
        this.command_queue.push(command_obj);
    } else {
        // Do not expect a reply
        // Does this work in combination with the pub sub mode?
        if (command_obj.callback) {
            utils.reply_in_order(this, command_obj.callback, null, undefined, this.command_queue);
        }
        if (this.reply === 'SKIP') {
            this.reply = 'SKIP_ONE_MORE';
        } else if (this.reply === 'SKIP_ONE_MORE') {
            this.reply = 'ON';
        }
    }
    return !this.should_buffer;
};

RedisClient.prototype.write_strings = function () {
    var str = '';
    for (var command = this.pipeline_queue.shift(); command; command = this.pipeline_queue.shift()) {
        // Write to stream if the string is bigger than 4mb. The biggest string may be Math.pow(2, 28) - 15 chars long
        if (str.length + command.length > 4 * 1024 * 1024) {
            this.should_buffer = !this.stream.write(str);
            str = '';
        }
        str += command;
    }
    if (str !== '') {
        this.should_buffer = !this.stream.write(str);
    }
};

RedisClient.prototype.write_buffers = function () {
    for (var command = this.pipeline_queue.shift(); command; command = this.pipeline_queue.shift()) {
        this.should_buffer = !this.stream.write(command);
    }
};

RedisClient.prototype.write = function (data) {
    if (this.pipeline === false) {
        this.should_buffer = !this.stream.write(data);
        return;
    }
    this.pipeline_queue.push(data);
};

Object.defineProperty(exports, 'debugMode', {
    get: function () {
        return this.debug_mode;
    },
    set: function (val) {
        this.debug_mode = val;
    }
});

// Don't officially expose the command_queue directly but only the length as read only variable
Object.defineProperty(RedisClient.prototype, 'command_queue_length', {
    get: function () {
        return this.command_queue.length;
    }
});

Object.defineProperty(RedisClient.prototype, 'offline_queue_length', {
    get: function () {
        return this.offline_queue.length;
    }
});

// Add support for camelCase by adding read only properties to the client
// All known exposed snake_case variables are added here
Object.defineProperty(RedisClient.prototype, 'retryDelay', {
    get: function () {
        return this.retry_delay;
    }
});

Object.defineProperty(RedisClient.prototype, 'retryBackoff', {
    get: function () {
        return this.retry_backoff;
    }
});

Object.defineProperty(RedisClient.prototype, 'commandQueueLength', {
    get: function () {
        return this.command_queue.length;
    }
});

Object.defineProperty(RedisClient.prototype, 'offlineQueueLength', {
    get: function () {
        return this.offline_queue.length;
    }
});

Object.defineProperty(RedisClient.prototype, 'shouldBuffer', {
    get: function () {
        return this.should_buffer;
    }
});

Object.defineProperty(RedisClient.prototype, 'connectionId', {
    get: function () {
        return this.connection_id;
    }
});

Object.defineProperty(RedisClient.prototype, 'serverInfo', {
    get: function () {
        return this.server_info;
    }
});

exports.createClient = function () {
    return new RedisClient(unifyOptions.apply(null, arguments));
};
exports.RedisClient = RedisClient;
exports.print = utils.print;
exports.Multi = require('./lib/multi');
exports.AbortError = errorClasses.AbortError;
exports.RedisError = Parser.RedisError;
exports.ParserError = Parser.ParserError;
exports.ReplyError = Parser.ReplyError;
exports.AggregateError = errorClasses.AggregateError;

// Add all redis commands / node_redis api to the client
require('./lib/individualCommands');
require('./lib/extendedApi');
require('./lib/commands');

},{"./lib/command":13,"./lib/commands":14,"./lib/createClient":15,"./lib/customErrors":16,"./lib/debug":17,"./lib/extendedApi":18,"./lib/individualCommands":19,"./lib/multi":20,"./lib/utils":21,"double-ended-queue":2,"events":undefined,"net":undefined,"redis-commands":5,"redis-parser":6,"tls":undefined,"util":undefined}],13:[function(require,module,exports){
'use strict';

var betterStackTraces = /development/i.test(process.env.NODE_ENV) || /\bredis\b/i.test(process.env.NODE_DEBUG);

function Command (command, args, callback, call_on_write) {
    this.command = command;
    this.args = args;
    this.buffer_args = false;
    this.callback = callback;
    this.call_on_write = call_on_write;
    if (betterStackTraces) {
        this.error = new Error();
    }
}

module.exports = Command;

},{}],14:[function(require,module,exports){
'use strict';

var commands = require('redis-commands');
var Multi = require('./multi');
var RedisClient = require('../').RedisClient;
var Command = require('./command');
// Feature detect if a function may change it's name
var changeFunctionName = (function () {
    var fn = function abc () {};
    try {
        Object.defineProperty(fn, 'name', {
            value: 'foobar'
        });
        return true;
    } catch (e) {
        return false;
    }
}());

// TODO: Rewrite this including the invidual commands into a Commands class
// that provided a functionality to add new commands to the client

commands.list.forEach(function (command) {

    // Some rare Redis commands use special characters in their command name
    // Convert those to a underscore to prevent using invalid function names
    var commandName = command.replace(/(?:^([0-9])|[^a-zA-Z0-9_$])/g, '_$1');

    // Do not override existing functions
    if (!RedisClient.prototype[command]) {
        RedisClient.prototype[command.toUpperCase()] = RedisClient.prototype[command] = function () {
            var arr;
            var len = arguments.length;
            var callback;
            var i = 0;
            if (Array.isArray(arguments[0])) {
                arr = arguments[0];
                if (len === 2) {
                    callback = arguments[1];
                }
            } else if (len > 1 && Array.isArray(arguments[1])) {
                if (len === 3) {
                    callback = arguments[2];
                }
                len = arguments[1].length;
                arr = new Array(len + 1);
                arr[0] = arguments[0];
                for (; i < len; i += 1) {
                    arr[i + 1] = arguments[1][i];
                }
            } else {
                // The later should not be the average use case
                if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
                    len--;
                    callback = arguments[len];
                }
                arr = new Array(len);
                for (; i < len; i += 1) {
                    arr[i] = arguments[i];
                }
            }
            return this.internal_send_command(new Command(command, arr, callback));
        };
        if (changeFunctionName) {
            Object.defineProperty(RedisClient.prototype[command], 'name', {
                value: commandName
            });
        }
    }

    // Do not override existing functions
    if (!Multi.prototype[command]) {
        Multi.prototype[command.toUpperCase()] = Multi.prototype[command] = function () {
            var arr;
            var len = arguments.length;
            var callback;
            var i = 0;
            if (Array.isArray(arguments[0])) {
                arr = arguments[0];
                if (len === 2) {
                    callback = arguments[1];
                }
            } else if (len > 1 && Array.isArray(arguments[1])) {
                if (len === 3) {
                    callback = arguments[2];
                }
                len = arguments[1].length;
                arr = new Array(len + 1);
                arr[0] = arguments[0];
                for (; i < len; i += 1) {
                    arr[i + 1] = arguments[1][i];
                }
            } else {
                // The later should not be the average use case
                if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
                    len--;
                    callback = arguments[len];
                }
                arr = new Array(len);
                for (; i < len; i += 1) {
                    arr[i] = arguments[i];
                }
            }
            this.queue.push(new Command(command, arr, callback));
            return this;
        };
        if (changeFunctionName) {
            Object.defineProperty(Multi.prototype[command], 'name', {
                value: commandName
            });
        }
    }
});

},{"../":12,"./command":13,"./multi":20,"redis-commands":5}],15:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var URL = require('url');

module.exports = function createClient (port_arg, host_arg, options) {

    if (typeof port_arg === 'number' || typeof port_arg === 'string' && /^\d+$/.test(port_arg)) {

        var host;
        if (typeof host_arg === 'string') {
            host = host_arg;
        } else {
            if (options && host_arg) {
                throw new TypeError('Unknown type of connection in createClient()');
            }
            options = options || host_arg;
        }
        options = utils.clone(options);
        options.host = host || options.host;
        options.port = port_arg;

    } else if (typeof port_arg === 'string' || port_arg && port_arg.url) {

        options = utils.clone(port_arg.url ? port_arg : host_arg || options);
        var parsed = URL.parse(port_arg.url || port_arg, true, true);

        // [redis:]//[[user][:password]@][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
        if (parsed.slashes) { // We require slashes
            if (parsed.auth) {
                options.password = parsed.auth.split(':')[1];
            }
            if (parsed.protocol && parsed.protocol !== 'redis:') {
                console.warn('node_redis: WARNING: You passed "' + parsed.protocol.substring(0, parsed.protocol.length - 1) + '" as protocol instead of the "redis" protocol!');
            }
            if (parsed.pathname && parsed.pathname !== '/') {
                options.db = parsed.pathname.substr(1);
            }
            if (parsed.hostname) {
                options.host = parsed.hostname;
            }
            if (parsed.port) {
                options.port = parsed.port;
            }
            if (parsed.search !== '') {
                var elem;
                for (elem in parsed.query) {
                    // If options are passed twice, only the parsed options will be used
                    if (elem in options) {
                        if (options[elem] === parsed.query[elem]) {
                            console.warn('node_redis: WARNING: You passed the ' + elem + ' option twice!');
                        } else {
                            throw new RangeError('The ' + elem + ' option is added twice and does not match');
                        }
                    }
                    options[elem] = parsed.query[elem];
                }
            }
        } else if (parsed.hostname) {
            throw new RangeError('The redis url must begin with slashes "//" or contain slashes after the redis protocol');
        } else {
            options.path = port_arg;
        }

    } else if (typeof port_arg === 'object' || port_arg === undefined) {
        options = utils.clone(port_arg || options);
        options.host = options.host || host_arg;

        if (port_arg && arguments.length !== 1) {
            throw new TypeError('To many arguments passed to createClient. Please only pass the options object');
        }
    }

    if (!options) {
        throw new TypeError('Unknown type of connection in createClient()');
    }

    return options;
};

},{"./utils":21,"url":undefined}],16:[function(require,module,exports){
'use strict';

var util = require('util');
var assert = require('assert');
var RedisError = require('redis-parser').RedisError;
var ADD_STACKTRACE = false;

function AbortError (obj, stack) {
    assert(obj, 'The options argument is required');
    assert.strictEqual(typeof obj, 'object', 'The options argument has to be of type object');

    RedisError.call(this, obj.message, ADD_STACKTRACE);
    Object.defineProperty(this, 'message', {
        value: obj.message || '',
        configurable: true,
        writable: true
    });
    if (stack || stack === undefined) {
        Error.captureStackTrace(this, AbortError);
    }
    for (var keys = Object.keys(obj), key = keys.pop(); key; key = keys.pop()) {
        this[key] = obj[key];
    }
}

function AggregateError (obj) {
    assert(obj, 'The options argument is required');
    assert.strictEqual(typeof obj, 'object', 'The options argument has to be of type object');

    AbortError.call(this, obj, ADD_STACKTRACE);
    Object.defineProperty(this, 'message', {
        value: obj.message || '',
        configurable: true,
        writable: true
    });
    Error.captureStackTrace(this, AggregateError);
    for (var keys = Object.keys(obj), key = keys.pop(); key; key = keys.pop()) {
        this[key] = obj[key];
    }
}

util.inherits(AbortError, RedisError);
util.inherits(AggregateError, AbortError);

Object.defineProperty(AbortError.prototype, 'name', {
    value: 'AbortError',
    configurable: true,
    writable: true
});
Object.defineProperty(AggregateError.prototype, 'name', {
    value: 'AggregateError',
    configurable: true,
    writable: true
});

module.exports = {
    AbortError: AbortError,
    AggregateError: AggregateError
};

},{"assert":undefined,"redis-parser":6,"util":undefined}],17:[function(require,module,exports){
'use strict';

var index = require('../');

function debug () {
    if (index.debug_mode) {
        console.error.apply(null, arguments);
    }
}

module.exports = debug;

},{"../":12}],18:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var debug = require('./debug');
var RedisClient = require('../').RedisClient;
var Command = require('./command');
var noop = function () {};

/**********************************************
All documented and exposed API belongs in here
**********************************************/

// Redirect calls to the appropriate function and use to send arbitrary / not supported commands
RedisClient.prototype.send_command = RedisClient.prototype.sendCommand = function (command, args, callback) {
    // Throw to fail early instead of relying in order in this case
    if (typeof command !== 'string') {
        throw new TypeError('Wrong input type "' + (command !== null && command !== undefined ? command.constructor.name : command) + '" for command name');
    }
    if (!Array.isArray(args)) {
        if (args === undefined || args === null) {
            args = [];
        } else if (typeof args === 'function' && callback === undefined) {
            callback = args;
            args = [];
        } else {
            throw new TypeError('Wrong input type "' + args.constructor.name + '" for args');
        }
    }
    if (typeof callback !== 'function' && callback !== undefined) {
        throw new TypeError('Wrong input type "' + (callback !== null ? callback.constructor.name : 'null') + '" for callback function');
    }

    // Using the raw multi command is only possible with this function
    // If the command is not yet added to the client, the internal function should be called right away
    // Otherwise we need to redirect the calls to make sure the interal functions don't get skipped
    // The internal functions could actually be used for any non hooked function
    // but this might change from time to time and at the moment there's no good way to distinguishe them
    // from each other, so let's just do it do it this way for the time being
    if (command === 'multi' || typeof this[command] !== 'function') {
        return this.internal_send_command(new Command(command, args, callback));
    }
    if (typeof callback === 'function') {
        args = args.concat([callback]); // Prevent manipulating the input array
    }
    return this[command].apply(this, args);
};

RedisClient.prototype.end = function (flush) {
    // Flush queue if wanted
    if (flush) {
        this.flush_and_error({
            message: 'Connection forcefully ended and command aborted.',
            code: 'NR_CLOSED'
        });
    } else if (arguments.length === 0) {
        this.warn(
            'Using .end() without the flush parameter is deprecated and throws from v.3.0.0 on.\n' +
            'Please check the doku (https://github.com/NodeRedis/node_redis) and explictly use flush.'
        );
    }
    // Clear retry_timer
    if (this.retry_timer) {
        clearTimeout(this.retry_timer);
        this.retry_timer = null;
    }
    this.stream.removeAllListeners();
    this.stream.on('error', noop);
    this.connected = false;
    this.ready = false;
    this.closing = true;
    return this.stream.destroySoon();
};

RedisClient.prototype.unref = function () {
    if (this.connected) {
        debug("Unref'ing the socket connection");
        this.stream.unref();
    } else {
        debug('Not connected yet, will unref later');
        this.once('connect', function () {
            this.unref();
        });
    }
};

RedisClient.prototype.duplicate = function (options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    var existing_options = utils.clone(this.options);
    options = utils.clone(options);
    for (var elem in options) {
        existing_options[elem] = options[elem];
    }
    var client = new RedisClient(existing_options);
    client.selected_db = this.selected_db;
    if (typeof callback === 'function') {
        var ready_listener = function () {
            callback(null, client);
            client.removeAllListeners(error_listener);
        };
        var error_listener = function (err) {
            callback(err);
            client.end(true);
        };
        client.once('ready', ready_listener);
        client.once('error', error_listener);
        return;
    }
    return client;
};

},{"../":12,"./command":13,"./debug":17,"./utils":21}],19:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var debug = require('./debug');
var Multi = require('./multi');
var Command = require('./command');
var no_password_is_set = /no password is set/;
var loading = /LOADING/;
var RedisClient = require('../').RedisClient;

/********************************************************************************************
 Replace built-in redis functions

 The callback may be hooked as needed. The same does not apply to the rest of the function.
 State should not be set outside of the callback if not absolutly necessary.
 This is important to make sure it works the same as single command or in a multi context.
 To make sure everything works with the offline queue use the "call_on_write" function.
 This is going to be executed while writing to the stream.

 TODO: Implement individal command generation as soon as possible to prevent divergent code
 on single and multi calls!
********************************************************************************************/

RedisClient.prototype.multi = RedisClient.prototype.MULTI = function multi (args) {
    var multi = new Multi(this, args);
    multi.exec = multi.EXEC = multi.exec_transaction;
    return multi;
};

// ATTENTION: This is not a native function but is still handled as a individual command as it behaves just the same as multi
RedisClient.prototype.batch = RedisClient.prototype.BATCH = function batch (args) {
    return new Multi(this, args);
};

function select_callback (self, db, callback) {
    return function (err, res) {
        if (err === null) {
            // Store db in this.select_db to restore it on reconnect
            self.selected_db = db;
        }
        utils.callback_or_emit(self, callback, err, res);
    };
}

RedisClient.prototype.select = RedisClient.prototype.SELECT = function select (db, callback) {
    return this.internal_send_command(new Command('select', [db], select_callback(this, db, callback)));
};

Multi.prototype.select = Multi.prototype.SELECT = function select (db, callback) {
    this.queue.push(new Command('select', [db], select_callback(this._client, db, callback)));
    return this;
};

RedisClient.prototype.monitor = RedisClient.prototype.MONITOR = function monitor (callback) {
    // Use a individual command, as this is a special case that does not has to be checked for any other command
    var self = this;
    var call_on_write = function () {
        // Activating monitor mode has to happen before Redis returned the callback. The monitor result is returned first.
        // Therefore we expect the command to be properly processed. If this is not the case, it's not an issue either.
        self.monitoring = true;
    };
    return this.internal_send_command(new Command('monitor', [], callback, call_on_write));
};

// Only works with batch, not in a transaction
Multi.prototype.monitor = Multi.prototype.MONITOR = function monitor (callback) {
    // Use a individual command, as this is a special case that does not has to be checked for any other command
    if (this.exec !== this.exec_transaction) {
        var self = this;
        var call_on_write = function () {
            self._client.monitoring = true;
        };
        this.queue.push(new Command('monitor', [], callback, call_on_write));
        return this;
    }
    // Set multi monitoring to indicate the exec that it should abort
    // Remove this "hack" as soon as Redis might fix this
    this.monitoring = true;
    return this;
};

function quit_callback (self, callback) {
    return function (err, res) {
        if (err && err.code === 'NR_CLOSED') {
            // Pretent the quit command worked properly in this case.
            // Either the quit landed in the offline queue and was flushed at the reconnect
            // or the offline queue is deactivated and the command was rejected right away
            // or the stream is not writable
            // or while sending the quit, the connection ended / closed
            err = null;
            res = 'OK';
        }
        utils.callback_or_emit(self, callback, err, res);
        if (self.stream.writable) {
            // If the socket is still alive, kill it. This could happen if quit got a NR_CLOSED error code
            self.stream.destroy();
        }
    };
}

RedisClient.prototype.QUIT = RedisClient.prototype.quit = function quit (callback) {
    // TODO: Consider this for v.3
    // Allow the quit command to be fired as soon as possible to prevent it landing in the offline queue.
    // this.ready = this.offline_queue.length === 0;
    var backpressure_indicator = this.internal_send_command(new Command('quit', [], quit_callback(this, callback)));
    // Calling quit should always end the connection, no matter if there's a connection or not
    this.closing = true;
    this.ready = false;
    return backpressure_indicator;
};

// Only works with batch, not in a transaction
Multi.prototype.QUIT = Multi.prototype.quit = function quit (callback) {
    var self = this._client;
    var call_on_write = function () {
        // If called in a multi context, we expect redis is available
        self.closing = true;
        self.ready = false;
    };
    this.queue.push(new Command('quit', [], quit_callback(self, callback), call_on_write));
    return this;
};

function info_callback (self, callback) {
    return function (err, res) {
        if (res) {
            var obj = {};
            var lines = res.toString().split('\r\n');
            var line, parts, sub_parts;

            for (var i = 0; i < lines.length; i++) {
                parts = lines[i].split(':');
                if (parts[1]) {
                    if (parts[0].indexOf('db') === 0) {
                        sub_parts = parts[1].split(',');
                        obj[parts[0]] = {};
                        while (line = sub_parts.pop()) {
                            line = line.split('=');
                            obj[parts[0]][line[0]] = +line[1];
                        }
                    } else {
                        obj[parts[0]] = parts[1];
                    }
                }
            }
            obj.versions = [];
            if (obj.redis_version) {
                obj.redis_version.split('.').forEach(function (num) {
                    obj.versions.push(+num);
                });
            }
            // Expose info key/vals to users
            self.server_info = obj;
        } else {
            self.server_info = {};
        }
        utils.callback_or_emit(self, callback, err, res);
    };
}

// Store info in this.server_info after each call
RedisClient.prototype.info = RedisClient.prototype.INFO = function info (section, callback) {
    var args = [];
    if (typeof section === 'function') {
        callback = section;
    } else if (section !== undefined) {
        args = Array.isArray(section) ? section : [section];
    }
    return this.internal_send_command(new Command('info', args, info_callback(this, callback)));
};

Multi.prototype.info = Multi.prototype.INFO = function info (section, callback) {
    var args = [];
    if (typeof section === 'function') {
        callback = section;
    } else if (section !== undefined) {
        args = Array.isArray(section) ? section : [section];
    }
    this.queue.push(new Command('info', args, info_callback(this._client, callback)));
    return this;
};

function auth_callback (self, pass, callback) {
    return function (err, res) {
        if (err) {
            if (no_password_is_set.test(err.message)) {
                self.warn('Warning: Redis server does not require a password, but a password was supplied.');
                err = null;
                res = 'OK';
            } else if (loading.test(err.message)) {
                // If redis is still loading the db, it will not authenticate and everything else will fail
                debug('Redis still loading, trying to authenticate later');
                setTimeout(function () {
                    self.auth(pass, callback);
                }, 100);
                return;
            }
        }
        utils.callback_or_emit(self, callback, err, res);
    };
}

RedisClient.prototype.auth = RedisClient.prototype.AUTH = function auth (pass, callback) {
    debug('Sending auth to ' + this.address + ' id ' + this.connection_id);

    // Stash auth for connect and reconnect.
    this.auth_pass = pass;
    var ready = this.ready;
    this.ready = ready || this.offline_queue.length === 0;
    var tmp = this.internal_send_command(new Command('auth', [pass], auth_callback(this, pass, callback)));
    this.ready = ready;
    return tmp;
};

// Only works with batch, not in a transaction
Multi.prototype.auth = Multi.prototype.AUTH = function auth (pass, callback) {
    debug('Sending auth to ' + this.address + ' id ' + this.connection_id);

    // Stash auth for connect and reconnect.
    this.auth_pass = pass;
    this.queue.push(new Command('auth', [pass], auth_callback(this._client, callback)));
    return this;
};

RedisClient.prototype.client = RedisClient.prototype.CLIENT = function client () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else if (Array.isArray(arguments[1])) {
        if (len === 3) {
            callback = arguments[2];
        }
        len = arguments[1].length;
        arr = new Array(len + 1);
        arr[0] = arguments[0];
        for (; i < len; i += 1) {
            arr[i + 1] = arguments[1][i];
        }
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this;
    var call_on_write = undefined;
    // CLIENT REPLY ON|OFF|SKIP
    /* istanbul ignore next: TODO: Remove this as soon as Travis runs Redis 3.2 */
    if (arr.length === 2 && arr[0].toString().toUpperCase() === 'REPLY') {
        var reply_on_off = arr[1].toString().toUpperCase();
        if (reply_on_off === 'ON' || reply_on_off === 'OFF' || reply_on_off === 'SKIP') {
            call_on_write = function () {
                self.reply = reply_on_off;
            };
        }
    }
    return this.internal_send_command(new Command('client', arr, callback, call_on_write));
};

Multi.prototype.client = Multi.prototype.CLIENT = function client () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else if (Array.isArray(arguments[1])) {
        if (len === 3) {
            callback = arguments[2];
        }
        len = arguments[1].length;
        arr = new Array(len + 1);
        arr[0] = arguments[0];
        for (; i < len; i += 1) {
            arr[i + 1] = arguments[1][i];
        }
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this._client;
    var call_on_write = undefined;
    // CLIENT REPLY ON|OFF|SKIP
    /* istanbul ignore next: TODO: Remove this as soon as Travis runs Redis 3.2 */
    if (arr.length === 2 && arr[0].toString().toUpperCase() === 'REPLY') {
        var reply_on_off = arr[1].toString().toUpperCase();
        if (reply_on_off === 'ON' || reply_on_off === 'OFF' || reply_on_off === 'SKIP') {
            call_on_write = function () {
                self.reply = reply_on_off;
            };
        }
    }
    this.queue.push(new Command('client', arr, callback, call_on_write));
    return this;
};

RedisClient.prototype.hmset = RedisClient.prototype.HMSET = function hmset () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else if (Array.isArray(arguments[1])) {
        if (len === 3) {
            callback = arguments[2];
        }
        len = arguments[1].length;
        arr = new Array(len + 1);
        arr[0] = arguments[0];
        for (; i < len; i += 1) {
            arr[i + 1] = arguments[1][i];
        }
    } else if (typeof arguments[1] === 'object' && (arguments.length === 2 || arguments.length === 3 && (typeof arguments[2] === 'function' || typeof arguments[2] === 'undefined'))) {
        arr = [arguments[0]];
        for (var field in arguments[1]) {
            arr.push(field, arguments[1][field]);
        }
        callback = arguments[2];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    return this.internal_send_command(new Command('hmset', arr, callback));
};

Multi.prototype.hmset = Multi.prototype.HMSET = function hmset () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else if (Array.isArray(arguments[1])) {
        if (len === 3) {
            callback = arguments[2];
        }
        len = arguments[1].length;
        arr = new Array(len + 1);
        arr[0] = arguments[0];
        for (; i < len; i += 1) {
            arr[i + 1] = arguments[1][i];
        }
    } else if (typeof arguments[1] === 'object' && (arguments.length === 2 || arguments.length === 3 && (typeof arguments[2] === 'function' || typeof arguments[2] === 'undefined'))) {
        arr = [arguments[0]];
        for (var field in arguments[1]) {
            arr.push(field, arguments[1][field]);
        }
        callback = arguments[2];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    this.queue.push(new Command('hmset', arr, callback));
    return this;
};

RedisClient.prototype.subscribe = RedisClient.prototype.SUBSCRIBE = function subscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this;
    var call_on_write = function () {
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    return this.internal_send_command(new Command('subscribe', arr, callback, call_on_write));
};

Multi.prototype.subscribe = Multi.prototype.SUBSCRIBE = function subscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this._client;
    var call_on_write = function () {
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    this.queue.push(new Command('subscribe', arr, callback, call_on_write));
    return this;
};

RedisClient.prototype.unsubscribe = RedisClient.prototype.UNSUBSCRIBE = function unsubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this;
    var call_on_write = function () {
        // Pub sub has to be activated even if not in pub sub mode, as the return value is manipulated in the callback
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    return this.internal_send_command(new Command('unsubscribe', arr, callback, call_on_write));
};

Multi.prototype.unsubscribe = Multi.prototype.UNSUBSCRIBE = function unsubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this._client;
    var call_on_write = function () {
        // Pub sub has to be activated even if not in pub sub mode, as the return value is manipulated in the callback
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    this.queue.push(new Command('unsubscribe', arr, callback, call_on_write));
    return this;
};

RedisClient.prototype.psubscribe = RedisClient.prototype.PSUBSCRIBE = function psubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this;
    var call_on_write = function () {
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    return this.internal_send_command(new Command('psubscribe', arr, callback, call_on_write));
};

Multi.prototype.psubscribe = Multi.prototype.PSUBSCRIBE = function psubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this._client;
    var call_on_write = function () {
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    this.queue.push(new Command('psubscribe', arr, callback, call_on_write));
    return this;
};

RedisClient.prototype.punsubscribe = RedisClient.prototype.PUNSUBSCRIBE = function punsubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this;
    var call_on_write = function () {
        // Pub sub has to be activated even if not in pub sub mode, as the return value is manipulated in the callback
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    return this.internal_send_command(new Command('punsubscribe', arr, callback, call_on_write));
};

Multi.prototype.punsubscribe = Multi.prototype.PUNSUBSCRIBE = function punsubscribe () {
    var arr,
        len = arguments.length,
        callback,
        i = 0;
    if (Array.isArray(arguments[0])) {
        arr = arguments[0];
        callback = arguments[1];
    } else {
        len = arguments.length;
        // The later should not be the average use case
        if (len !== 0 && (typeof arguments[len - 1] === 'function' || typeof arguments[len - 1] === 'undefined')) {
            len--;
            callback = arguments[len];
        }
        arr = new Array(len);
        for (; i < len; i += 1) {
            arr[i] = arguments[i];
        }
    }
    var self = this._client;
    var call_on_write = function () {
        // Pub sub has to be activated even if not in pub sub mode, as the return value is manipulated in the callback
        self.pub_sub_mode = self.pub_sub_mode || self.command_queue.length + 1;
    };
    this.queue.push(new Command('punsubscribe', arr, callback, call_on_write));
    return this;
};

},{"../":12,"./command":13,"./debug":17,"./multi":20,"./utils":21}],20:[function(require,module,exports){
'use strict';

var Queue = require('double-ended-queue');
var utils = require('./utils');
var Command = require('./command');

function Multi (client, args) {
    this._client = client;
    this.queue = new Queue();
    var command, tmp_args;
    if (args) { // Either undefined or an array. Fail hard if it's not an array
        for (var i = 0; i < args.length; i++) {
            command = args[i][0];
            tmp_args = args[i].slice(1);
            if (Array.isArray(command)) {
                this[command[0]].apply(this, command.slice(1).concat(tmp_args));
            } else {
                this[command].apply(this, tmp_args);
            }
        }
    }
}

function pipeline_transaction_command (self, command_obj, index) {
    // Queueing is done first, then the commands are executed
    var tmp = command_obj.callback;
    command_obj.callback = function (err, reply) {
        // Ignore the multi command. This is applied by node_redis and the user does not benefit by it
        if (err && index !== -1) {
            if (tmp) {
                tmp(err);
            }
            err.position = index;
            self.errors.push(err);
        }
        // Keep track of who wants buffer responses:
        // By the time the callback is called the command_obj got the buffer_args attribute attached
        self.wants_buffers[index] = command_obj.buffer_args;
        command_obj.callback = tmp;
    };
    self._client.internal_send_command(command_obj);
}

Multi.prototype.exec_atomic = Multi.prototype.EXEC_ATOMIC = Multi.prototype.execAtomic = function exec_atomic (callback) {
    if (this.queue.length < 2) {
        return this.exec_batch(callback);
    }
    return this.exec(callback);
};

function multi_callback (self, err, replies) {
    var i = 0, command_obj;

    if (err) {
        err.errors = self.errors;
        if (self.callback) {
            self.callback(err);
            // Exclude connection errors so that those errors won't be emitted twice
        } else if (err.code !== 'CONNECTION_BROKEN') {
            self._client.emit('error', err);
        }
        return;
    }

    if (replies) {
        while (command_obj = self.queue.shift()) {
            if (replies[i] instanceof Error) {
                var match = replies[i].message.match(utils.err_code);
                // LUA script could return user errors that don't behave like all other errors!
                if (match) {
                    replies[i].code = match[1];
                }
                replies[i].command = command_obj.command.toUpperCase();
                if (typeof command_obj.callback === 'function') {
                    command_obj.callback(replies[i]);
                }
            } else {
                // If we asked for strings, even in detect_buffers mode, then return strings:
                replies[i] = self._client.handle_reply(replies[i], command_obj.command, self.wants_buffers[i]);
                if (typeof command_obj.callback === 'function') {
                    command_obj.callback(null, replies[i]);
                }
            }
            i++;
        }
    }

    if (self.callback) {
        self.callback(null, replies);
    }
}

Multi.prototype.exec_transaction = function exec_transaction (callback) {
    if (this.monitoring || this._client.monitoring) {
        var err = new RangeError(
            'Using transaction with a client that is in monitor mode does not work due to faulty return values of Redis.'
        );
        err.command = 'EXEC';
        err.code = 'EXECABORT';
        return utils.reply_in_order(this._client, callback, err);
    }
    var self = this;
    var len = self.queue.length;
    self.errors = [];
    self.callback = callback;
    self._client.cork();
    self.wants_buffers = new Array(len);
    pipeline_transaction_command(self, new Command('multi', []), -1);
    // Drain queue, callback will catch 'QUEUED' or error
    for (var index = 0; index < len; index++) {
        // The commands may not be shifted off, since they are needed in the result handler
        pipeline_transaction_command(self, self.queue.get(index), index);
    }

    self._client.internal_send_command(new Command('exec', [], function (err, replies) {
        multi_callback(self, err, replies);
    }));
    self._client.uncork();
    return !self._client.should_buffer;
};

function batch_callback (self, cb, i) {
    return function batch_callback (err, res) {
        if (err) {
            self.results[i] = err;
            // Add the position to the error
            self.results[i].position = i;
        } else {
            self.results[i] = res;
        }
        cb(err, res);
    };
}

Multi.prototype.exec = Multi.prototype.EXEC = Multi.prototype.exec_batch = function exec_batch (callback) {
    var self = this;
    var len = self.queue.length;
    var index = 0;
    var command_obj;
    if (len === 0) {
        utils.reply_in_order(self._client, callback, null, []);
        return !self._client.should_buffer;
    }
    self._client.cork();
    if (!callback) {
        while (command_obj = self.queue.shift()) {
            self._client.internal_send_command(command_obj);
        }
        self._client.uncork();
        return !self._client.should_buffer;
    }
    var callback_without_own_cb = function (err, res) {
        if (err) {
            self.results.push(err);
            // Add the position to the error
            var i = self.results.length - 1;
            self.results[i].position = i;
        } else {
            self.results.push(res);
        }
        // Do not emit an error here. Otherwise each error would result in one emit.
        // The errors will be returned in the result anyway
    };
    var last_callback = function (cb) {
        return function (err, res) {
            cb(err, res);
            callback(null, self.results);
        };
    };
    self.results = [];
    while (command_obj = self.queue.shift()) {
        if (typeof command_obj.callback === 'function') {
            command_obj.callback = batch_callback(self, command_obj.callback, index);
        } else {
            command_obj.callback = callback_without_own_cb;
        }
        if (typeof callback === 'function' && index === len - 1) {
            command_obj.callback = last_callback(command_obj.callback);
        }
        this._client.internal_send_command(command_obj);
        index++;
    }
    self._client.uncork();
    return !self._client.should_buffer;
};

module.exports = Multi;

},{"./command":13,"./utils":21,"double-ended-queue":2}],21:[function(require,module,exports){
'use strict';

// hgetall converts its replies to an Object. If the reply is empty, null is returned.
// These function are only called with internal data and have therefore always the same instanceof X
function replyToObject (reply) {
    // The reply might be a string or a buffer if this is called in a transaction (multi)
    if (reply.length === 0 || !(reply instanceof Array)) {
        return null;
    }
    var obj = {};
    for (var i = 0; i < reply.length; i += 2) {
        obj[reply[i].toString('binary')] = reply[i + 1];
    }
    return obj;
}

function replyToStrings (reply) {
    if (reply instanceof Buffer) {
        return reply.toString();
    }
    if (reply instanceof Array) {
        var res = new Array(reply.length);
        for (var i = 0; i < reply.length; i++) {
            // Recusivly call the function as slowlog returns deep nested replies
            res[i] = replyToStrings(reply[i]);
        }
        return res;
    }

    return reply;
}

function print (err, reply) {
    if (err) {
        // A error always begins with Error:
        console.log(err.toString());
    } else {
        console.log('Reply: ' + reply);
    }
}

var camelCase;
// Deep clone arbitrary objects with arrays. Can't handle cyclic structures (results in a range error)
// Any attribute with a non primitive value besides object and array will be passed by reference (e.g. Buffers, Maps, Functions)
// All capital letters are going to be replaced with a lower case letter and a underscore infront of it
function clone (obj) {
    var copy;
    if (Array.isArray(obj)) {
        copy = new Array(obj.length);
        for (var i = 0; i < obj.length; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        copy = {};
        var elems = Object.keys(obj);
        var elem;
        while (elem = elems.pop()) {
            if (elem === 'tls') { // special handle tls
                copy[elem] = obj[elem];
                continue;
            }
            // Accept camelCase options and convert them to snake_case
            var snake_case = elem.replace(/[A-Z][^A-Z]/g, '_$&').toLowerCase();
            // If camelCase is detected, pass it to the client, so all variables are going to be camelCased
            // There are no deep nested options objects yet, but let's handle this future proof
            if (snake_case !== elem.toLowerCase()) {
                camelCase = true;
            }
            copy[snake_case] = clone(obj[elem]);
        }
        return copy;
    }
    return obj;
}

function convenienceClone (obj) {
    camelCase = false;
    obj = clone(obj) || {};
    if (camelCase) {
        obj.camel_case = true;
    }
    return obj;
}

function callbackOrEmit (self, callback, err, res) {
    if (callback) {
        callback(err, res);
    } else if (err) {
        self.emit('error', err);
    }
}

function replyInOrder (self, callback, err, res, queue) {
    // If the queue is explicitly passed, use that, otherwise fall back to the offline queue first,
    // as there might be commands in both queues at the same time
    var command_obj;
    /* istanbul ignore if: TODO: Remove this as soon as we test Redis 3.2 on travis */
    if (queue) {
        command_obj = queue.peekBack();
    } else {
        command_obj = self.offline_queue.peekBack() || self.command_queue.peekBack();
    }
    if (!command_obj) {
        process.nextTick(function () {
            callbackOrEmit(self, callback, err, res);
        });
    } else {
        var tmp = command_obj.callback;
        command_obj.callback = tmp ?
            function (e, r) {
                tmp(e, r);
                callbackOrEmit(self, callback, err, res);
            } :
            function (e, r) {
                if (e) {
                    self.emit('error', e);
                }
                callbackOrEmit(self, callback, err, res);
            };
    }
}

module.exports = {
    reply_to_strings: replyToStrings,
    reply_to_object: replyToObject,
    print: print,
    err_code: /^([A-Z]+)\s+(.+)$/,
    monitor_regex: /^[0-9]{10,11}\.[0-9]+ \[[0-9]+ .+\]( ".+?")+$/,
    clone: convenienceClone,
    callback_or_emit: callbackOrEmit,
    reply_in_order: replyInOrder
};

},{}],"main-action":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var crypto = require('crypto');
var redis = require('redis');

// default field is used to adapt a SET into a HSET in Redis
// by convention, this action uses only hashes, to achieve an easier API and impl
var DEFAULT_FIELD = "_default_";

function _fail_on_missing(param_name, params, reject) {
  if (params[param_name] == null || typeof params[param_name] == "undefined") {
    reject({
      "message": "Parameter " + param_name + " is required."
    });
    return true;
  }
}

function _set_handler(params, resolve, reject, redis_client) {
  var key = params.key;
  var value = params.value;
  if (typeof value == "string" || typeof value == "number") {
    // wrap the value into an object to be used with hmset
    value = _defineProperty({}, DEFAULT_FIELD, value);
  }

  redis_client.hmset(key, value, function (err, response) {
    if (err !== null && typeof err !== "undefined") {
      console.error(err);
      reject({
        error: err.toString(),
        type: "redis_hmset"
      });
    }
    console.log("Redis response:" + response);
    resolve({
      key: key,
      value: params.value,
      context: params.context || null
    });
  });
  // TODO: what if value is an array ?
}

function _get_handler(params, resolve, reject, redis_client) {
  var key = params.key;
  var value = params.value;
  var get_redis_handler = function get_redis_handler(err, response) {
    if (err !== null && typeof err !== "undefined") {
      console.error(err);
      reject({
        error: err.toString(),
        type: "redis_hmget"
      });
    }
    console.log("Redis response:" + JSON.stringify(response));

    // if the response is an array and params.fields is not null, match fields with response
    if (response !== null && response.constructor == Array) {
      var fields_array = params.fields.split(",");
      var response_object = {};
      for (var i = 0; i < fields_array.length; i++) {
        response_object[fields_array[i]] = response[i];
      }
      response = response_object;
    }

    // response is null when the key is missing

    if (response !== null && (typeof response === 'undefined' ? 'undefined' : _typeof(response)) == "object") {
      if (response[DEFAULT_FIELD] !== null && typeof response[DEFAULT_FIELD] !== "undefined") {
        response = response[DEFAULT_FIELD];
      }
    }

    resolve({
      key: key,
      value: response,
      context: params.context || null
    });
  };

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
  return new Promise(function (resolve, reject) {
    if (_fail_on_missing("redis_host", params, reject) || _fail_on_missing("key", params, reject)) {
      return;
    }

    if (process.env.__redis_client !== null && typeof process.env.__redis_client !== "undefined") {
      redis = require(process.env.__redis_client);
    }

    var redis_client = redis.createClient(params.redis_host, {
      //A string used to prefix all used keys (e.g. namespace:test)
      prefix: crypto.createHash('md5').update(process.env.__OW_API_KEY || "local").digest('hex') + ":",
      password: params.redis_auth
    });

    redis_client.on("error", function (err) {
      console.error(err);
      reject({
        error: err.toString(),
        type: "redis_conn"
      });
    });

    if (params.value !== null && typeof params.value !== "undefined") {
      _set_handler(params, resolve, reject, redis_client);
      // TODO: handle timeouts
      return;
    }
    // GET values from cache
    console.log("GET key:" + params.key);
    _get_handler(params, resolve, reject, redis_client);
  });
}

exports.default = main;

},{"crypto":undefined,"redis":12}]},{},[]);
var main = require('main-action').default;
