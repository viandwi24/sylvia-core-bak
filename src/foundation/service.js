class Service {
  constructor(options) {
    this.options = options
    this.name = options.name;
  }

  getStatus(...args) {
    let status
    try {
      status = this.options.callback.status(...args);
    } catch (error) {
      console.error(error)
      status = 'unknow'
    }
    return status
  }
}

module.exports = Service;