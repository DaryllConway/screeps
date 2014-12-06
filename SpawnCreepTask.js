module.exports = (function () {
  'use strict';

  var Task = require('Task');

  function SpawnCreepTask() {
    SpawnCreepTask.__super__.constructor.call(this, 'spawnCreep', 14000);
  }

  SpawnCreepTask.__super__ = Task.prototype;
  SpawnCreepTask.prototype = Object.create(SpawnCreepTask.__super__);
  SpawnCreepTask.prototype.constructor = SpawnCreepTask;

  SpawnCreepTask.prototype.doTask = function doTask() {

  };

  return SpawnCreepTask;

})();