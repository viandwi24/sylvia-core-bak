class Schedule {
  register() {}
  boot(app) {
    // app.schedule.add('backup-data', '* * * * * *', () => {
    //   app.command.log('Backup data')
    // })
  }
}

module.exports = Schedule;