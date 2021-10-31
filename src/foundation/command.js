const CommandInterface = require('./../command/interface');

class CommandApplication {
  constructor() {
    this.interface = new CommandInterface(this)
    this.handleCommandInput()
    this.commands = []
    this.addDefaultCommand()
  }

  addDefaultCommand() {
    const $this = this
    this.add({
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
    })
    this.add({
      name: 'exit',
      description: 'Exit application',
      callback: function () {
        $this.interface.commandInterface.close()
        process.exit(0)        
      }
    })
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
      callback: this.callbackCommandInput.bind(this)
    })
  }
  callbackCommandInput(line) {
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
      }
    })

    // search
    const command = this.commands.find(command => command.name === commandName)
    if (command) {
      try {
        command.callback.call(this, args, options)
      } catch (error) {
        this.println(error)
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