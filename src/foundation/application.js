const { Container } = require('@halliganjs/service-container')
const CommandApplication = require('./command')
const Log = require('./log')
const Schedule = require('./../schedule/schedule')
const path = require('path')
const fs = require('fs')

class Application {
  configs = {
    app: {
      name: '',
    }
  }
  services = []

  constructor(app) {
    this.configs.app.name = app
    this.handleConsole()
    this.initContainer()
    this.initSchedule()
  }

  handleConsole() {
    this.command = new CommandApplication
  }

  initContainer() {
    this.container = new Container
    this.container.instance('app', this)
  }

  initSchedule() {
    this.schedule = new Schedule(this)
    // this.schedule.add('backup-data', '* * * * * *', () => {
    //   this.command.log('Backup data')
    // })
  }

  // keep app running
  run() {
    // Create Progess Bar
    const pb = this.command.interface.createProggressBar('Booting')
    pb.on('finish', () => {
      // 
      this.command.log('Booting Complete')
      // Start Input Mode
      this.command.startInputMode()
    })
    pb.start()

    // Load config file
    this.loadConfigs()
    pb.update(10)
    // Load service
    this.loadServices()
    pb.update(75)
    // Run the schedule
    this.schedule.start()
    pb.finish()
  }

  loadConfigs() {
    this.command.log('Load Config File')

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
    this.command.log('Load Service File')
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
        this.command.log('Error load service: ' + service)
      }
    })

    // register the services
    this.services.forEach(serviceName => {
      const service = this.container.make(serviceName)
      try {
        service.register(this)
        this.command.log(`Registring ${serviceName}`)
      } catch (error) {
        this.command.log(`Error register service: ${serviceName}`)
        this.services.splice(this.services.indexOf(serviceName), 1)
      }
    })

    // boot the services
    this.services.forEach(serviceName => {
      const service = this.container.make(serviceName)
      try {
        service.boot(this)
        this.command.log(`Booting ${serviceName}`)
      } catch (error) {
        this.command.log(`Error boot service: "${serviceName}" ${error}`)
        this.services.splice(this.services.indexOf(serviceName), 1)
      }
    })

    // startup the services
    this.services.forEach(serviceName => {
      const service = this.container.make(serviceName)
      try {
        if (typeof service.startup !== 'undefined') {
          service.startup(this)
        }
      } catch (error) {
        this.command.log(`Error Startup service: "${serviceName}" ${error}`)
      }
    })
  }
}

module.exports = Application