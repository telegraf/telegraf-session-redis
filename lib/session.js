var debug = require('debug')('telegraf-session-redis')
var redis = require('redis')
var thunkify = require('thunkify')

module.exports = function (opts) {
  opts = opts || {}
  redisOption = opts.store || {}
  opts.getSessionKey = opts.getSessionKey || function (msg) {
      //CallbackQuery handling
      msg = msg.message || msg
      if (!msg.chat && !msg.from) {
        return
      }
      return `${msg.chat.id}:${msg.from.id}`
  }
  var client = redis.createClient(
    redisOption.port,
    redisOption.host,
    redisOption.options
  )
  client.get = thunkify(client.get)
  client.set = thunkify(client.set)
  client.ttl = redisOption.ttl ? function expire (key) { client.expire(key, redisOption.ttl); } : function () {}

  return function * (next) {
    if (!this.msg) {
      return yield next
    }
    var session = {}
    this.__defineGetter__('session', function () {
      return session
    })
    this.__defineSetter__('session', function (val) {
      session = Object.assign({}, val)
    })
    var key = opts.getSessionKey(this.msg)
    if (key) {
      debug('key %s', key)
      try {
        var json = yield client.get(key)
        debug('json %s', json)
        if (json) {
          session = JSON.parse(json)
        }
      } catch (e) {
        debug('encounter error %s', e)
      }
    }
    try {
      yield next
    } catch (err) {
      throw err
    } finally {
      if (key) {
        debug('save session', session)
        yield client.set(key, JSON.stringify(session))
        client.ttl(key)
      }
    }
  }
}
