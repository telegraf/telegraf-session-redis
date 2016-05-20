# Redis session middleware for Telegraf

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-session-redis.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-session-redis)
[![NPM Version](https://img.shields.io/npm/v/telegraf-session-redis.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-session-redis)

Redis store-based session middleware for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-session-redis
```

## Example
  
```js
var Telegraf = require('telegraf')
var session = require('telegraf-session-redis')

var telegraf = new Telegraf(process.env.BOT_TOKEN)

telegraf.use(session({
    store: {
      host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
      port: process.env.TELEGRAM_SESSION_PORT || 6379
    },
  },
))

telegraf.on('text', function * (){
  this.session.counter = this.session.counter || 0
  this.session.counter++
  console.log('Session', this.session)
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
* `ttl`: session ttl (default: forever)
* `getSessionKey`: session key function (event -> string)

Default session key depends on sender and chat(if available):

```js
function getSessionKey(event) {
  var chatId = 'global'
  if (event.chat) {
    // Handle messages
    chatId = event.chat.id
  }
  // Handle CallbackQuery
  if (event.message && event.message.chat) {
    chatId = event.message.chat.id
  }
  return `${event.from.id}:${chatId}`
}
```

### Destroying a session

To destroy a session simply set it to `null`.

```js
this.session = null
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

