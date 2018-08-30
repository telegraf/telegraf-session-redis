const debug = require('debug')('telegraf:session-redis')
const redis = require('redis')

const getRedisSessionKey = (ctx) => {
    if (ctx.from && ctx.chat) {
        return `${ctx.from.id}:${ctx.chat.id}`;
    } if (ctx.update && ctx.update.update_id && ctx.update.inline_query.id) {
        return `${ctx.update.update_id}:${ctx.update.inline_query.id}`;
    }

    return null;
}

class RedisSession {
  constructor (options) {
    this.options = Object.assign({
      property: 'session',
      getSessionKey: getRedisSessionKey,
      store: {}
    }, options)

    this.client = redis.createClient(this.options.store)
  }

  getSession (key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, json) => {
        if (err) {
          return reject(err)
        }
        if (json) {
          try {
            const session = JSON.parse(json)
            debug('session state', key, session)
            resolve(session)
          } catch (error) {
            debug('Parse session state failed', error)
          }
        }
        resolve({})
      })
    })
  }

  clearSession (key) {
    debug('clear session', key)
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, json) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  saveSession (key, session) {
    if (!session || Object.keys(session).length === 0) {
      return this.clearSession(key)
    }
    debug('save session', key, session)
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(session), (err, json) => {
        if (err) {
          return reject(err)
        }
        if (this.options.ttl) {
          debug('session ttl', session)
          this.client.expire(key, this.options.ttl)
        }
        resolve({})
      })
    })
  }

  middleware () {
    return (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      return this.getSession(key).then((session) => {
        debug('session snapshot', key, session)
        Object.defineProperty(ctx, this.options.property, {
          get: function () { return session },
          set: function (newValue) { session = Object.assign({}, newValue) }
        })
        return next().then(() => this.saveSession(key, session))
      })
    }
  }
}

module.exports = RedisSession
