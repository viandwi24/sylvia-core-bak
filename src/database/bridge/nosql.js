var DB = require('nosql')

module.exports = {
  db: undefined,
  interface: undefined,
  config: {},
  listeners: [
    {
      event: 'load',
      callback: (interface) => {
        this.interface = interface;
        this.config = interface.config;
        this.db = DB.load(this.config.path);
        console.log(this.db);
      }
    }
  ]
}
