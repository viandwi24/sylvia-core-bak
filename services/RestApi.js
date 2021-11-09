const express = require('express')

function initExpress() {
  const app = express()
  return app
}

class RestApi {
  constructor(app) {
    this.app = app
    this.registeredRoutesCallback = []
  }
  
  register() {
    const provider = this
    this.express = initExpress()
    this.app.container.instance('express', express);
    this.app.command.add({
      name: 'restapi',
      description: 'REST API',
      callback: {
        start: {
          description: 'Start REST API',
          handle: () => provider.start()
        },
        stop: {
          description: 'Stop REST API',
          handle: () => provider.stop()
        }
      }
    })
    this.app.registerService({
      name: 'restapi',
      callback: {
        status: function () {
          let server
          try {
            server = provider.app.container.make('express-server')
          } catch (error) {
            server = undefined
          }
          return (server) ? 'active' : 'inactive'
        }
      }
    })
  }

  boot() {
  }

  startup() {
    this.app.command.dispatch('restapi', ['start'])
    // this.app.command.dispatch('services', ['status'])
    // this.app.command.dispatch('services', [], { help: true })
  }

  start() {
    const port = 80
    this.app.command.log('[REST API] Starting...')
    this.initServer({ port })
  }

  stop() {
    this.app.command.log('[REST API] Stopping...')
    try {
      const server = this.app.container.make('express-server')
      server.close()
      this.app.container.instance('express-server', undefined)
      this.app.command.log('[REST API] Stopped')
    } catch (error) {
      console.error(error)
    }
  }

  initServer({ port }) {
    this.express.use(this.logging.bind(this))
    this.initRoutes(this.express)
    const server = this.express.listen(port, () => {
      this.log(`Server Started On Port ${port}`)
    })
    this.app.container.instance('express-server', server)
  }

  initRoutes(app) {
    if (typeof app === 'undefined')  app = express()
    const configs = this.app.configs
    app.get('/', (req, res) => {
      res.json({
        app: {
          name: configs.app.name
        }
      })
    })
    app.get('/db', (req, res) => {
      res.json(db)
    })
    this.registeredRoutesCallback.forEach(route => {
      route(app)
    })
  }

  registerRouteCallback(route) {
    this.registeredRoutesCallback.push(route)
  }

  logging(req, res, next) {
    this.log(`Request ${req.method} ${req.url} ${req.ip}`)
    next()
  }

  log(text) {
    this.app.command.log(`[REST API] ${text}`)
  }
}

module.exports = RestApi;