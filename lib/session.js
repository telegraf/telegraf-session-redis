const debug = require('debug')('telegraf:session-redis')
const redis = require('redis')

class RedisSession {
  constructor (options) {
    this.options = Object.assign({
      property: 'session',
      getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
      store: {}
    }, options)

    this.client = redis.createClient(this.options.store)
    this.client.connect()
  }

  async getSession (key) {
    try {
      const json = await this.client.get(key)
      if (json) {
        try {
          const session = JSON.parse(json)
          debug('session state', key, session)
          return session
        } catch (error) {
          debug('Parse session state failed', error)
        }
      }
      return {}
    } catch (error) {
      throw new Error(error)
    }
  }

  async clearSession (key) {
    try {
      debug('clear session', key)
      await this.client.del(key)
      return
    } catch (error) {
      throw new Error(error)
    }
  }

  async saveSession (key, session) {
    try {
      if (!session || Object.keys(session).length === 0) {
        return this.clearSession(key)
      }
      debug('save session', key, session)
      if (this.options.ttl) {
        await this.client.set(key, JSON.stringify(session), 'EX', this.options.ttl)
      } else {
        await this.client.set(key, JSON.stringify(session))
      }
      return {}
    } catch (error) {
      throw new Error(error)
    }
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

process.on('SIGINT', function () {
  redisClient.quit()
  console.log('redis client quit')
})

module.exports = RedisSession
