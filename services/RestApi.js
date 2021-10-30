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
    this.express = initExpress()
    this.app.container.instance('express', express);
  }
  boot() {
    const port = 80
    this.express.listen(port, () => {
      this.log(`Server Started On Port ${port}`)
    })
    this.express.use(this.logging.bind(this))
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