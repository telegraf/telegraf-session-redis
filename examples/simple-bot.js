var Telegraf = require('telegraf')
var redisSession = require('../lib/session')

var app = new Telegraf(process.env.BOT_TOKEN)

app.use(redisSession({
  store: {
    host: process.env.SESSION_PORT_6379_TCP_ADDR || '127.0.0.1',
    port: process.env.SESSION_PORT_6379_TCP_PORT || 6379,
    ttl: 3600
  }
}))

app.on('text', function * () {
  this.session.counter = this.session.counter || 0
  this.session.counter++
})

app.on('/stats', function * () {
  yield this.reply(`${this.session.counter} messages from ${this.message.from.username}`)
})

app.startPolling(10)
