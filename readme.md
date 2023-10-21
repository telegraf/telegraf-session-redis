# ⚠️ This package is deprecated. Use [@telegraf/session](https://github.com/telegraf/session).

---

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

const bot = new Telegraf(process.env.BOT_TOKEN)

const session = new RedisSession({
  store: {
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
  }
})

bot.use(session)

bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  console.log('Session', ctx.session)
})

bot.launch()
```

When you have stored the session key beforehand, you can access a
session without having access to a context object. This is useful when
you perform OAUTH or something similar, when a REDIRECT_URI is called
on your bot server.

```js
const redisSession = new RedisSession()

// Retrieve session state by session key
redisSession.getSession(key)
  .then((session) => {
    console.log('Session state', session)
  })

// Save session state
redisSession.saveSession(key, session)
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
* `ttl`: session ttl in seconds (default: forever)
* `getSessionKey`: session key resolver function `(ctx) => any`)

Default implementation of `getSessionKey`:

```js
function getSessionKey (ctx) {
  if (!ctx.from || !ctx.chat) {
    return
  }
  return `${ctx.from.id}:${ctx.chat.id}`
}
```

### Destroying a session

To destroy a session simply set it to `null`.

```js
bot.on('text', (ctx) => {
  ctx.session = null
})

```
