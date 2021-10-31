const express = require('express')

function initExpress() {
  const app = express()
  return app
}

class RestApi {
  constructor(app) {
    this.app = app
  }
  
  register() {
    const service = this
    this.express = initExpress()
    this.app.container.instance('express', express);
    this.app.command.add({
      name: 'restapi',
      description: 'Starts the REST API',
      callback: function (args, options) {
        if (args[0] === 'start') {
          service.start()
        } else if (args[0] === 'stop') {
          service.stop()
        }
      }
    })
  }

  boot() {
  }

  startup() {
  }

  start() {
    const port = 80
    this.app.command.log('[REST API] Starting...')
    this.express.listen(port, () => {
      this.log(`Server Started On Port ${port}`)
    })
    this.express.use(this.logging.bind(this))
  }

  stop() {
    this.app.command.log('[REST API] Stopping...')
    this.express.close()
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