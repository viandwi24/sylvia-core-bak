const DatabaseInterface = require('./interface')

module.exports = {
  config: {
    driver: 'nosql',
    path: `${process.cwd()}/data/db/main.nosql`
  },
  interface: new DatabaseInterface(),
  load: function () {
  }
}