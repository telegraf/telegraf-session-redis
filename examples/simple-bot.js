const Telegraf = require('telegraf')
const RedisSession = require('../lib/session')

const bot = new Telegraf(process.env.BOT_TOKEN)

const session = new RedisSession({ ttl: 5 })

bot.use(session.middleware())

bot.on('text', (ctx, next) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  return next()
})

bot.hears('/stats', ({ reply, session, from }) => reply(`${session.counter} messages from ${from.username}`))

bot.startPolling()
