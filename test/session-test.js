var Telegraf = require('telegraf')
var should = require('should')
var session = require('../lib/session')

describe('Telegraf Session', function () {
  it('should be defined', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      (ctx) => {
        should.exist(ctx.session)
        ctx.session.foo = 42
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('should handle existing session', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      (ctx) => {
        should.exist(ctx.session)
        ctx.session.should.have.property('foo')
        ctx.session.foo.should.be.equal(42)
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('should handle not existing session', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      (ctx) => {
        should.exist(ctx.session)
        ctx.session.should.not.have.property('foo')
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 999}, text: 'hey'}})
  })

  it('should handle session reset', function (done) {
    var app = new Telegraf()
    app.on('text',
      session(),
      (ctx) => {
        ctx.session = null
        should.exist(ctx.session)
        ctx.session.should.not.have.property('foo')
        done()
      })
    app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
  })

  it('ttl', function (done) {
    this.timeout(5000)
    var app = new Telegraf()
    app.on('photo',
      session({ttl: 1}),
      (ctx) => {
        ctx.session.photo = 'sample.png'
        ctx.session.photo.should.be.equal('sample.png')
        setTimeout(function () {
          app.handleUpdate({
            message: {
              chat: {id: 1},
              from: {id: 1},
              text: 'hey'
            }
          })
        }, 2000)
      })
    app.on('text',
      session(),
      (ctx) => {
        ctx.session.should.not.have.property('photo')
        done()
      })
    setTimeout(function () {
      app.handleUpdate({
        message: {
          chat: {id: 1},
          from: {id: 1},
          photo: {}
        }
      })
    }, 100)
  })
})
