const Telegraf = require('telegraf')
const RedisSession = require('../lib/session')

const telegraf = new Telegraf(process.env.BOT_TOKEN)

// Redis client available at session.client
const session = new RedisSession()

telegraf.use(session.middleware())

telegraf.on('text', (ctx, next) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  return next()
})

telegraf.hears('/stats', (ctx) => {
  return ctx.reply(`${ctx.session.counter} messages from ${ctx.from.username}`)
})

telegraf.startPolling(30)
