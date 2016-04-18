# Telegraf redis session middleware

[![Build Status](https://travis-ci.org/telegraf/telegraf-session-redis.png?branch=master)](https://travis-ci.org/telegraf/telegraf-session-redis)

Redis store-based session middleware for Telegtaf.

## Installation

```js
$ npm install telegraf-session-redis
```

## Example
  
```js
var telegraf = require('telegraf');
var session = require('telegraf-session-redis');

var app = telegraf(process.env.BOT_TOKEN);

app.use(session({
    store: {
      host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
      port: process.env.TELEGRAM_SESSION_PORT || 6379,
      ttl: 3600,
    },
  },
));

app.use(function * (){
  this.session.counter = this.session.counter || 0
  this.session.counter++
  console.log('->', this.session)
})

app.startPolling();
```

## API

### Options

* `store`: [Redis connection options](http://redis.js.org/#api-rediscreateclient)
  * `host`: Redis host (default: *127.0.0.1*)
  * `port`: Redis port (default: *6379*)
  * `path`: Unix socket string
  * `url`:  Redis url

* `getSessionKey`: session key function (msg -> string)

Default session key depends on sender id and chat id:
```
function getSessionKey(msg) {
  if (!msg.chat && !msg.from) {
    return
  }
  return `${msg.chat.id}:${msg.from.username}`
}
```

### Destroying a session

To destroy a session simply set it to `null`:

```js
this.session = null;
```

## License

MIT
