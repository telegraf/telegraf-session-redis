[![Build Status](https://img.shields.io/travis/telegraf/telegraf-session-redis.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-session-redis)
[![NPM Version](https://img.shields.io/npm/v/telegraf-session-redis.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-session-redis)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Redis session middleware for Telegraf

Redis powered session middleware for [Telegraf](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-session-redis
```

## Example
  
```js
const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')

const telegraf = new Telegraf(process.env.BOT_TOKEN)

const session = new RedisSession({
  store: {
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
  }
})

telegraf.use(session.middleware())

telegraf.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  console.log('Session', ctx.session)
})

telegraf.startPolling()
```

## API

### Options

* `store`: 
  * `host`: Redis host (default: *127.0.0.1*)
  * `port`: Redis port (default: *6379*)
  * `path`: Unix socket string
  * `url`:  Redis url
  * `...`: [Other redis connection options](http://redis.js.org/#api-rediscreateclient)
* `property`: context property name (default: `session`)
* `ttl`: session ttl (default: forever)
* `getSessionKey`: session key function `(ctx) => any`)

Default implementation of `getSessionKey`:

```js
function getSessionKey(ctx) {
  if (!ctx.from || !ctx.chat) {
    return
  }
  return `${ctx.from.id}:${ctx.chat.id}`
}
```

### Destroying a session

To destroy a session simply set it to `null`.

```js
telegraf.on('text', (ctx) => {
  ctx.session = null
})

```

## License

The MIT License (MIT)

Copyright (c) 2016 Vitaly Domnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

