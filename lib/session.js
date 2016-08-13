const debug = require('debug')('telegraf:session-redis')
const bluebird = require('bluebird')
const redis = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

class RedisSession {

  constructor (options) {
    this.options = Object.assign({
      property: 'session',
      getSessionKey: (ctx) => {
        if (!ctx.from || !ctx.chat) {
          return
        }
        return `${ctx.from.id}:${ctx.chat.id}`
      },
      store: {}
    }, options)

    this.client = redis.createClient(this.options.store)
    this.client.ttl = this.options.ttl ? (key) => this.client.expire(key, this.options.ttl) : () => undefined
  }

  middleware () {
    return (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      debug('session key %s', key)
      var session = {}
      Object.defineProperty(ctx, this.options.property, {
        get: function () { return session },
        set: function (newValue) { session = Object.assign({}, newValue) }
      })
      return this.client.getAsync(key)
        .then((json) => {
          if (json) {
            try {
              session = JSON.parse(json)
              debug('session state', session)
            } catch (error) {
              debug('Parse session strate failed', error)
            }
          }
          return next()
        })
        .then(() => {
          if (Object.keys(session).length === 0) {
            debug('clear session')
            return this.client.delAsync(key)
          }
          debug('save session', session)
          return this.client.setAsync(key, JSON.stringify(session))
            .then(() => {
              this.client.ttl(key)
            })
        })
    }
  }
}

module.exports = RedisSession
