# Telegraf redis session middleware

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-session-redis.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-session-redis)
[![NPM Version](https://img.shields.io/npm/v/telegraf-session-redis.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-session-redis)

Redis store-based session middleware for [Telegraf](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-session-redis
```

## Example
  
```js
var telegraf = require('telegraf')
var session = require('telegraf-session-redis')

var app = telegraf(process.env.BOT_TOKEN)

app.use(session({
    store: {
      host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
      port: process.env.TELEGRAM_SESSION_PORT || 6379
    },
  },
))

app.on('text', function * (){
  this.session.counter = this.session.counter || 0
  this.session.counter++
  console.log('->', this.session)
})

app.startPolling()
```

## API

### Options

* `store`: [Redis connection options](http://redis.js.org/#api-rediscreateclient)
  * `host`: Redis host (default: *127.0.0.1*)
  * `port`: Redis port (default: *6379*)
  * `path`: Unix socket string
  * `url`:  Redis url
* `ttl`: session ttl (default: forever)
* `getSessionKey`: session key function (event -> string)

Default session key depends on sender and chat(if available):

```
function getSessionKey(event) {
  var chatId = 'global'
  if (event.chat) {
    // Handle messages
    chatId = event.chat.id
  }
  if (event.message && event.message.chat) {
    // Handle CallbackQuery
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

MIT
