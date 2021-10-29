module.exports = {
  logs: [],
  config: {
    appName: 'LOG'
  },
  add: function(message) {
    message = `[LOG] ${message}`
    this.logs.push(message)
    console.log(message)
  },
  get: function() {
    return this.logs
  },
  clear: function() {
    this.logs = []
  }
}