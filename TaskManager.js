module.exports = (function () {
  'use strict';

  var Collection = require('Collection');

  function TaskManager() {
    TaskManager.__super__.constructor.call(this);
  }
  TaskManager.__super__ = Collection.prototype;
  TaskManager.prototype = Object.create(TaskManager.__super__);
  TaskManager.prototype.constructor = TaskManager;

  TaskManager.prototype.runTasks = function() {
    this.forEach(this.iterator);
  };
  TaskManager.prototype.iterator = function iterator(task) { task.run(); };

  return TaskManager;

})();