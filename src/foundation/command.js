const CommandInterface = require('./../command/interface');

class CommandApplication {
  constructor(app) {
    this.app = app
    this.interface = new CommandInterface(this)
    this.handleCommandInput()
    this.commands = []
    this.addDefaultCommand()
  }

  addDefaultCommand() {
    const $this = this
    const defaultsCommands = [
      {
        name: 'services',
        description: 'All Information About Services',
        callback: {
          status: {
            description: 'Show status of all services',
            handle: function ({ args, options }) {
              if (args.length === 0) {
                const servicesList = this.app.services
  
                const table = this.interface.createTable()
                  .setHeading('Services', 'Status')
                  .setAlign(['left', 'left'])
        
                servicesList.forEach(service => {
                  const status = service.getStatus({ args, options })
                  table.addRow(service.name, status)
                })
        
                this.println('All Services :')
                this.println(table.toString())
              } else {
                $this.println('Invalid argument')
              }
            }
          },
          default: ({ args, options, showHelp }) => {
            if (args.length === 0) {
              showHelp()
            } else {
              $this.println('Invalid argument')
            }
          }
        }
      },
      {
        name: 'help',
        description: 'Show help',
        callback: function () {
          const commandList = $this.commands.sort((a, b) => {
            if (a.name < b.name) return -1
            if (a.name > b.name) return 1
            return 0
          })
  
          const table = $this.interface.createTable()
            .setHeading('Command', 'Description')
            .setAlign(['left', 'left'])
  
          commandList.forEach(command => {
            table.addRow(command.name, command.description)
          })
  
          this.println('Available commands:')
          this.println(table.toString())
        }
      },
      {
        name: 'exit',
        description: 'Exit application',
        callback: function () {
          $this.interface.commandInterface.close()
          process.exit(0)        
        }
      }
    ]
    defaultsCommands.forEach(command => this.add(command))
  }

  /**
   * COMMAND
   */
  add(command) {
    this.commands.push(command)
  }
  handleCommandInput() {
    this.interface.listeners.push({
      event: 'line',
      callback: this.handleCallbackCommandInput.bind(this)
    })
  }
  handleCallbackCommandInput(line) {
    const lineRaw = line.split(' ')
    const commandName = lineRaw[0]

    // args
    const args = [...lineRaw]
    args.shift()

    // options
    const options = {}
    args.forEach(arg => {
      // arg with - or --
      if (arg.startsWith('-') || arg.startsWith('--')) {
        const option = {
          name: arg.replace(/^-*/, '').replace(/^--*/, '').replace(/=.*$/, ''),
          value: true
        }
        // check if option has value (--option=value) or not (--option value)
        if (arg.includes('=')) {
          option.value = arg.split('=')[1]
        } else if (args.indexOf(arg) + 1 < args.length) {
          option.value = args[args.indexOf(arg) + 1]
        }
        options[option.name] = option.value
        // delete from args
        args.splice(args.indexOf(arg), 1)
      }
    })

    // dispatch
    this.dispatch(commandName, args, options)
  }
  dispatch(commandName, args, options) {
    // search
    const command = this.commands.find(command => command.name === commandName)
    if (command) {
      try {
        if (typeof command.callback === 'undefined') return this.println('Command not have callback')
        if (typeof command.callback === 'object') {
          const showHelp = () => {
            const allCallbacksWithoutDefault = Object.keys(command.callback).filter(key => key !== 'default')

            const table = this.interface.createTable()
              .setHeading('Argument', 'Status')
              .setAlign(['left', 'left'])
    
            allCallbacksWithoutDefault.forEach(item => {
              table.addRow(item, command.callback[item].description)
            })
    
            this.println('Arguments :')
            this.println(table.toString())
          }

          if (args.length === 0 || (args.length > 0 && args[0] === 'help')) {
            if (typeof command.callback.help !== 'undefined') {
              if (typeof command.callback.help.handle !== 'undefined') {
                command.callback.help.handle.call(this, { args, options })
              } else {
                this.println(`Command help callback didnt have handle() method`)
              }
            } else {
              showHelp()
            }
          } else {
            // if command have callback per argument
            if (typeof command.callback[args[0]] === 'undefined') {
              if (typeof command.callback.default === 'function') {
                command.callback.default.call(this, { args, options })
              } else {
                this.println('Invalid argument command')
              }
            } else {
              if (typeof command.callback[args[0]].handle === 'undefined') {
                this.println(`Command callback for ${args[0]} didnt have handle() method`)
              } else {
                // 
                const arg = args[0]
                // remove first argument
                args.shift()
                // call
                command.callback[arg].handle.call(this, { args, options })
              }
            }
          }
        } else {
          command.callback.call(this, { args, options })
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      this.println('command not found : ' + commandName)
    }
  }

  startInputMode() {
    this.interface.startInputMode()
  }

  print(text) {
    this.interface.print(text)
  }

  println(text) {
    this.interface.println(text)
  }

  log(text, params = undefined) {
    this.interface.log(text, params)
  }
}

module.exports = CommandApplication