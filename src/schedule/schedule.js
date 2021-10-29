const cron = require('node-cron');
const Log = require('../foundation/log')

class Schedule {
  constructor() {
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
    Log.add('Starting Schedules')
    this.schedules.forEach(schedule => {
      this.started.push(schedule.key);
      schedule.task.start();
    });
  }

  stop() {
    Log.add('Stopping Schedules')
    this.schedules.forEach(schedule => {
      this.started.splice(this.started.indexOf(schedule.key), 1);
      schedule.task.stop();
    });
  }

  restart() {
    Log.add('Restarting Schedules')
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