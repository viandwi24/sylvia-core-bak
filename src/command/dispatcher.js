class CommandDispatcher {
  constructor(command) {
    this.command = command;
  }

  dispatch(commandName, args, options) {
    // if commandName is space or whitespace only
    if (commandName.trim() === '') return 
    // search
    const command = this.command.commands.find(command => command.name === commandName)
    // 
    if (command) {
      this.findCallback(command, args, options);
    } else {
      console.log(`Command "${commandName}" not found`);
    }
  }

  findCallback(command, args, options) {
    const dispatcher = this
    const println = (...args) => this.command.println(...args);
    const instance = {
      command,
      args,
      options: { ...options },
      hasOption: function(option) {
        return this.options.hasOwnProperty(option);
      },
      option: function(option) {
        return this.options[option];
      },
      hasCallback: function(callback) {
        const callbacks = this.command.callback
        if (typeof callbacks !== 'object') return false
        return callbacks.hasOwnProperty(callback)
      },
      callbackRunner(cb, args, options) {
        const params = { ...this }
        if (typeof args !== 'undefined') params.args = args
        if (typeof options !== 'undefined') params.options = options
        return cb.call(dispatcher.command, params);
      },
      showHelp() {
        println()
        if (typeof this.command.callback === 'object') {
          println(`${this.command.name} [argument..]\n`)
          println(`${this.command.description}\n`)

          // options
          const callbacksWithoutDefault = Object.keys(this.command.callback).filter(key => key !== 'default')
          const commandTable = dispatcher.command.interface.createTable()
            .setBorder(' ')
            .setAlign(['left', 'left'])

            callbacksWithoutDefault.forEach(key => {
            const callback = this.command.callback[key];
            commandTable.addRow(key, callback.description)
          })
          println(`\nCommands :`)
          println(commandTable.toString())
          
          println(`\nOptions :`)
          const options = this.command.options || []
          const optionTable = dispatcher.command.interface.createTable()
            .setBorder(' ')
            .setAlign(['left', 'left'])
            .addRow(`--help, -h`, 'Show Help')

            options.forEach(option => {
              optionTable.addRow(`--${option.name}, -${option?.alias}`, option.description)
            })
          println(optionTable.toString())
        }
      }
    }

    const callback = command.callback;
    if (typeof callback === 'undefined') return this.command.println(`Command "${command.name}" not have callback`);

    if (typeof callback === 'function') {
      callback.call(this.command, { args, options });
    } else if (typeof callback === 'object') {
      if (args.length === 0) {
        if (instance.hasCallback('default')) return instance.callbackRunner(callback.default);

        if (instance.hasOption('help') || instance.hasOption('h')) return instance.showHelp();
        this.command.println(`\n  ${command.name}`)
        this.command.println(`  ${command.description}\n`)
        this.command.println(`  For Help you can use --help or -h\n`)
      } else {
        const callbackName = args[0];
        if (instance.hasCallback(callbackName))  {
          if (typeof callback[callbackName].handle === 'function') {
            args.shift();
            instance.callbackRunner(callback[callbackName].handle);
          } else {
            this.command.println(`Argument "${callbackName}" not valid`);
          }
        }
      }
    }
  }
}

module.exports = CommandDispatcher;