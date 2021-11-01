// libs
const path = require('path');

// core
const { Application } = require('./src')

// instance
const Sylvia = new Application('SYLVIA')

// config
Sylvia.configs.app.configPath = path.join(__dirname, './config')
Sylvia.configs.app.servicePath = path.join(__dirname, './services')

// run the application
Sylvia.run()