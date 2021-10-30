const cron = require('node-cron');
const Log = require('../foundation/log')

class Schedule {
  constructor(app) {
    this.app = app
    this.schedules = [];
    this.started = [];
  }

  add(key, pattern, fn, instanceOptions = {}) {
    const defaultOptions = {
      scheduled: false
    }
    const options = Object.assign(defaultOptions, instanceOptions);
    const instance = cron.schedule(pattern, fn, options);
    this.schedules.push({ key, task: instance, fn, options });
  }

  start() {
    this.app.command.log('Starting Schedules')
    this.schedules.forEach(schedule => {
      this.started.push(schedule.key);
      schedule.task.start();
    });
  }

  stop() {
    this.app.command.log('Stopping Schedules')
    this.schedules.forEach(schedule => {
      this.started.splice(this.started.indexOf(schedule.key), 1);
      schedule.task.stop();
    });
  }

  restart() {
    this.app.command.log('Restarting Schedules')
    this.stop();
    this.start();
  }

  getSchedule(key) {
    return this.schedules.find(schedule => schedule.key === key);
  }

  getScheduleTask(key) {
    return this.getSchedule(key).task;
  }
}

module.exports = Schedule;