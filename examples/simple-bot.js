var Telegraf = require('telegraf')
var redisSession = require('../lib/session')

var app = new Telegraf(process.env.BOT_TOKEN, {polling: true})

var sessionMiddleware = redisSession({
  store: {
    host: process.env.SESSION_PORT_6379_TCP_ADDR || '127.0.0.1',
    port: process.env.SESSION_PORT_6379_TCP_PORT || 6379,
    ttl: 3600
  }
})

// if you want session for all messages :)
// app.use(sessionMiddleware)

app.on('text', sessionMiddleware, function * () {
  this.session.counter = this.session.counter || 0
  this.session.counter++
  console.log('->', this.session)
  yield this.reply(`${this.session.counter} messages from ${this.msg.from.username}`)
})

app.startPolling()
