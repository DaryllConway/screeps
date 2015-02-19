module.exports = (function () {
  'use strict';

  var Task = require('Task');
  var Collection = require('Collection');
  var CreepCollection = require('creep/CreepCollection');
  var Actions = require('behaviors/Actions');
  var K = require('K');
  var CreepFactory = require('creep/CreepFactory');

  function SetupGlobalObjectTask() {
    SetupGlobalObjectTask.__super__.constructor.call(this, 'setupGlobalObject', 0);
  }

  SetupGlobalObjectTask.__super__ = Task.prototype;
  SetupGlobalObjectTask.prototype = Object.create(SetupGlobalObjectTask.__super__);
  SetupGlobalObjectTask.prototype.constructor = SetupGlobalObjectTask;

  SetupGlobalObjectTask.prototype.doTask = function doTask() {
    K.rooms = new Collection();
    K.spawns = new Collection();
    K.creeps = new CreepCollection();
    K.workers = new CreepCollection();
    K.builders = new CreepCollection();
    K.transporters = new CreepCollection();

    Object.keys(Game.creeps).forEach(function (key) {
      var creep = Game.creeps[key];
      K.creeps.add(creep);
      K.rooms.add(creep.room);
      switch (creep.memory.type) {
        case CreepFactory.WORKER.type:
          K.workers.add(creep);
          creep.behavior = Actions.harvest;
          break;
        case CreepFactory.BUILDER.type:
          K.builders.add(creep);
          creep.behavior = Actions.build;
          break;
        case CreepFactory.TRANSPORTER.type:
          K.transporters.add(creep);
          creep.behavior = Actions.transport;
          break;
      }
    });
    Object.keys(Game.spawns).forEach(function (key) {
      var spawn = Game.spawns[key];
      K.spawns.add(spawn);
      K.rooms.add(spawn.room);
    });
  };

  return SetupGlobalObjectTask;

})();