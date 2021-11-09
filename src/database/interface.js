module.exports = class DatabaseInterface {
  constructor() {
    this.listeners = []
  }
  load(instance = {}) {
    this.initConfig(instance);
    this.bridge = require(`./bridge/${this.config.driver}`)
    const events = this.bridge.listeners
    events.forEach(event => {
      this.listeners.push(event)
    })
    this.dispatch('load', this)
  }
  dispatch(event, ...args) {
    const listeners = this.listeners.filter(listener => listener.event === event)
    let result = undefined
    listeners.forEach(listener => {
      const params = [this, result, { ...args }]
      result = listener.callback(...params)
    })
    return result
  }
  initConfig(instanceConfig) {
    const defaultConfig = {
      driver: 'nosql'
    }
    const config = Object.assign(defaultConfig, instanceConfig)
    this.config = config
  }
}