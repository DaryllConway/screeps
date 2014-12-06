module.exports = (function () {
  'use strict';

  var Storage = require('StorageElement');
  var instancedTasks = [];

  function Task(id, delta) {
    if (typeof id !== 'string') {
      throw new Error('The id of the Task must be a string, actually ' + (typeof id));
    }
    if (typeof delta !== 'number' || String(delta) === 'NaN' || delta < 32) {
      throw new Error('Cannot set a Task with a delta < 32, actually ' + String(delta));
    }
    if (instancedTasks.indexOf(id) !== -1) {
      throw new Error('Cannot instanciate task with the same id, actually ' + String(id));
    }
    instancedTasks.push(id);
    this.id = id;
    this.actionId = 'task.last.' + id;
    this.deltaKey = 'task.delta.' + id;
    Storage.set(this.deltaKey, delta);
    if (!Storage.contains(this.actionId)) {
      Storage.set(this.actionId, 0);
    }
  }

  Task.prototype.constructor = Task;

  Task.prototype.doTask = function doTask() {};

  Task.prototype.run = function run() {
    var now = Date.now();
    if (now > Storage.get(this.actionId) + Storage.get(this.deltaKey)) {
      if (Storage.get('debugMode') === true) {
        console.log('task.run(' + this.actionId + ')');
      }
      // Run the task
      this.doTask();
      Storage.set(this.actionId, now);
    }
  };

  return Task;

})();