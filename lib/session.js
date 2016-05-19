var debug = require('debug')('telegraf:session-redis')
var redis = require('redis')
var thunkify = require('thunkify')

module.exports = function (opts) {
  opts = Object.assign({
    getSessionKey: (event) => {
      var chatId = 'global'
      if (event.chat) {
        chatId = event.chat.id
      }
      if (event.message && event.message.chat) {
        chatId = event.message.chat.id
      }
      return `${event.from.id}:v${chatId}`
    },
    store: {}
  }, opts)

  var client = redis.createClient(opts.store)
  client.get = thunkify(client.get)
  client.set = thunkify(client.set)
  client.del = thunkify(client.del)
  client.ttl = opts.ttl ? (key) => client.expire(key, opts.ttl) : () => {
  }

  return function * (next) {
    var key = opts.getSessionKey(this.message || this.callbackQuery || this.inlineQuery || this.chosenInlineResult)
    if (!key) {
      return yield next
    }
    var session = {}
    this.__defineGetter__('session', function () {
      return session
    })
    this.__defineSetter__('session', function (val) {
      session = Object.assign({}, val)
    })
    debug('session key %s', key)
    try {
      var json = yield client.get(key)
      if (json) {
        session = JSON.parse(json)
      }
      yield next
    } catch (err) {
      throw err
    } finally {
      debug('save session', session)
      if (Object.keys(session).length === 0) {
        yield client.del(key)
      } else {
        yield client.set(key, JSON.stringify(session))
      }
      client.ttl(key)
    }
  }
}
