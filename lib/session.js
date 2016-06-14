const debug = require('debug')('telegraf:session-redis')
const bluebird = require('bluebird')
const redis = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = function (opts) {
  opts = Object.assign({
    getSessionKey: function (ctx) {
      return `${ctx.from.id}:${ctx.chat.id}`
    },
    store: {}
  }, opts)

  const client = redis.createClient(opts.store)
  client.ttl = opts.ttl ? (key) => client.expire(key, opts.ttl) : () => undefined

  return (ctx, next) => {
    var session = {}
    ctx.__defineGetter__('session', function () {
      return session
    })
    ctx.__defineSetter__('session', function (val) {
      session = Object.assign({}, val)
    })

    const key = opts.getSessionKey(ctx)
    if (!key) {
      return next()
    }
    debug('session key %s', key)
    return client.getAsync(key).then((json) => {
      if (json) {
        session = JSON.parse(json)
      }
      return next().then(() => {
        debug('save session', session)
        if (Object.keys(session).length === 0) {
          return client.delAsync(key)
        } else {
          return client.setAsync(key, JSON.stringify(session)).then(() => client.ttl(key))
        }
      })
    })
  }
}
