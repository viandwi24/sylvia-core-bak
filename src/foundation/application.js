const { Container } = require('@halliganjs/service-container')
const Log = require('./log')
const path = require('path')
const fs = require('fs')
const readline = require('readline')
const Schedule = require('./../schedule/schedule')

class Application {
  configs = {}
  services = []

  constructor() {
    Log.add('Starting')
    this.handleConsole()
    this.initContainer()
    this.initSchedule()
  }

  handleConsole() {
    const command = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    command.on('line', (line) => {
      if (line == 'stop') {
        this.schedule.stop()
      }
    })
    this.command = command
  }

  initContainer() {
    this.container = new Container()
    this.container.instance('app', this)
  }

  initSchedule() {
    this.schedule = new Schedule
  }

  // keep app running
  run() {
    // Load config file
    this.loadConfigs()
    // Load service
    this.loadServices()
    // Run the schedule
    this.schedule.start()
  }

  loadConfigs() {
    Log.add('Load Config File')

    // 
    const configPath = path.join(__dirname, '../../config')
    
    // listing all files in the config directory
    const configs = fs.readdirSync(configPath)
    
    // loading each config with ext name .js
    configs.forEach(config => {
      // file must be a .js file
      if (config.indexOf('.js') > -1) {
        // config name
        const configName = config.replace('.js', '')
        // require the config
        const configInstance = require(path.join(configPath, config))
        // register the config
        this.configs = Object.assign(this.configs, {
          [configName]: configInstance
        })
      }
    })

    // 
    Log.config.appName = this.configs.app.name
  }

  loadServices() {
    // 
    Log.add('Load Service File')
    const servicePath = path.join(__dirname, '../../services')
    // listing all files in the services directory
    const services = fs.readdirSync(servicePath)
    // loading each service with ext name .js
    services.forEach(service => {
      try {
        // file must be a .js file
        if (service.indexOf('.js') > -1) {
          // class name
          const className = service.replace('.js', '')
          // require the service
          const serviceClass = require(path.join(servicePath, service))
          // instantiate the service
          const serviceInstance = new serviceClass(this)
          // register the service
          const serviceInstanceName = `Services/${className}`
          this.container.instance(serviceInstanceName, serviceInstance)
          this.services.push(serviceInstanceName)
        }
      } catch (error) {
        Log.add('Error load service: ' + service)
      }
    })

    // register the services
    this.services.forEach(serviceName => {
      const service = this.container.make(serviceName)
      try {
        service.register(this)
      } catch (error) {
        Log.add(`Error register service: ${serviceName}`)
        this.services.splice(this.services.indexOf(serviceName), 1)
      }
    })

    // boot the services
    this.services.forEach(serviceName => {
      const service = this.container.make(serviceName)
      try {
        service.boot(this)
      } catch (error) {
        Log.add(`Error boot service: "${serviceName}" ${error}`)
        this.services.splice(this.services.indexOf(serviceName), 1)
      }
    })
  }
}

module.exports = Application