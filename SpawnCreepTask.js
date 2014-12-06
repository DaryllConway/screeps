module.exports = (function () {
  'use strict';

  var Task = require('Task');
  var CreepFactory = require('CreepFactory');

  function SpawnCreepTask() {
    SpawnCreepTask.__super__.constructor.call(this, 'spawnCreep', 13);
  }

  SpawnCreepTask.__super__ = Task.prototype;
  SpawnCreepTask.prototype = Object.create(SpawnCreepTask.__super__);
  SpawnCreepTask.prototype.constructor = SpawnCreepTask;

  SpawnCreepTask.prototype.doTask = function doTask() {
    CreepFactory.tryToFillAll();
  };

  return SpawnCreepTask;

})();