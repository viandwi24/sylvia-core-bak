const readline = require('readline')
const figlet = require('figlet')
const AsciiTable = require('ascii-table')

class CommandInterface {
  inputMode = false
  progressMode = false
  listeners = []

  constructor(command) {
    this.banner('SYLVIA')
    this.createInterface()
    this.addDefaultListeners()
  }

  createInterface() {
    this.commandInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  addDefaultListeners() {
    this.commandInterface.on('SIGINT', () => {
      this.commandInterface.question('Are you sure you want to exit? (yes/no) ', answer => {
        if (answer.match(/^y(es)?$/i)) {
          this.commandInterface.close()
          process.exit(0)
        }
      })
    })
    this.commandInterface.on('line', this.handleLine.bind(this))
  }

  handleLine(input) {
    try {
      if (this.inputMode) {
        this.listeners.filter(l => l.event === 'line').forEach(l => l.callback.call(this, input))
        this.startInputMode()
      }
    } catch (error) {
      this.println(error)
    }
  }

  /**
   * Start input mode
   */
  startInputMode() {
    const { commandInterface } = this
    this.inputMode = true
    this.commandInterface.prompt(true)
  }

  createProggressBar(text = '', size = 50, destroyOnComplete = true) {
    const command = this
    const pg = {
      text,
      size,
      max: 100,
      progress: 0,
      interval: 5,
      destroyOnComplete,
      listeners: [],
      update: function(i = undefined) {
        if (this.isFinished()) {
          return this.stop()
        }
        const newProgress = (i) ? i : (this.progress + 1)
        const a = setInterval(() => {
          if (this.progress >= newProgress) return clearInterval(a)
          this.progress = this.progress + 1
          this.draw()
        }, this.interval)
      },
      dispatch: function(event) {
        this.listeners.filter(l => l.event === event).forEach(l => l.callback.call(this))
      },
      draw: function() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        const progress = Math.round((this.progress / this.max) * this.size)
        const bar = '[' + '\u2588'.repeat(progress) + '\u2591'.repeat(this.size - progress) + '] '
        process.stdout.write(bar)
        process.stdout.write(`${this.text} (${this.progress}/${this.max})`)
        if (this.isFinished()) {
          this.destroy()
          this.dispatch('finish')
        }
      },
      finish: function() {
        this.update(this.max)
        this.draw()
      },
      reset: function() {
        this.update(0)
        this.draw()
      },
      start: function() {
        this.update(0)
        this.draw()
        command.progressMode = true
      },
      stop: function() {
        this.draw()
        command.progressMode = false
      },
      isFinished: function() {
        return this.progress === this.max
      },
      destroy: function() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      },
      on: function(event, callback) {
        this.listeners.push({ event, callback })
      }
    }
    return pg
  }

  createTable(name, options = {}) {
    return new AsciiTable(name, options)
  }

  banner(text, instanceOptions) {
    const defaultOptions = {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }
    const result = figlet.textSync(text, Object.assign(defaultOptions, instanceOptions))
    this.println(result)
    this.println()
  }

  log(text, params = null) {
    const now = `[${new Date().toLocaleTimeString()}]`

    if (this.inputMode || this.progressMode) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0); 
      // process.stdout.write("\r\x1b[K")
    }

    this.println(`${now} ${text}`)

    if (this.inputMode) {
      this.startInputMode()
    }
  }

  print(text) {
    if (typeof text === 'undefined') {
      text = ''
    } else if (typeof text === 'object') {
      text = JSON.stringify(text)
    }
    process.stdout.write(`${text}`)
  }

  println(text) {
    this.print(text)
    this.print('\n')
  }
}

module.exports = CommandInterface;