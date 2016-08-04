const debug = require('debug')('telegraf:session-redis')
const bluebird = require('bluebird')
const redis = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = function (opts) {
  opts = Object.assign({
    property: 'session',
    getSessionKey: (ctx) => {
      if (!ctx.from || !ctx.chat) {
        return
      }
      return `${ctx.from.id}:${ctx.chat.id}`
    },
    store: {}
  }, opts)

  const client = redis.createClient(opts.store)
  client.ttl = opts.ttl ? (key) => client.expire(key, opts.ttl) : () => undefined

  return (ctx, next) => {
    const key = opts.getSessionKey(ctx)
    if (!key) {
      return next()
    }
    debug('session key %s', key)
    var session = {}
    Object.defineProperty(ctx, opts.property, {
      get: function () { return session },
      set: function (newValue) { session = Object.assign({}, newValue) }
    })
    return client.getAsync(key)
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
          return client.delAsync(key)
        }
        debug('save session', session)
        return client.setAsync(key, JSON.stringify(session))
          .then(() => {
            debug('session ttl', session)
            client.ttl(key)
          })
      })
  }
}
