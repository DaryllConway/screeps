module.exports = (function () {
  'use strict';

  var Task = require('Task');
  var utils = require('utils');
  var collections = require('collections');
  var Actions = require('Actions');
  var K = require('K');
  var CreepFactory = require('CreepFactory');

  function SetupGlobalObjectTask() {
    SetupGlobalObjectTask.__super__.constructor.call(this, 'setupGlobalObject', 0);
  }

  SetupGlobalObjectTask.__super__ = Task.prototype;
  SetupGlobalObjectTask.prototype = Object.create(SetupGlobalObjectTask.__super__);
  SetupGlobalObjectTask.prototype.constructor = SetupGlobalObjectTask;

  SetupGlobalObjectTask.prototype.doTask = function doTask() {

    // Main creep collection
    K.creeps = new collections.CreepCollection();
    K.creeps.children = utils.valuesOf(Game.creeps);

    // setup typed creep collections
    K.workers  = K.creeps.filter(function (value) { return value && value.memory.type === CreepFactory.WORKER.type });
    K.builders = K.creeps.filter(function (value) { return value && value.memory.type === CreepFactory.BUILDER.type });

    K.workers.setAction(Actions.harvest);
    K.builders.setAction(Actions.build);

    // scan visible entities
    K.rooms = new collections.Collection();
    K.hostiles = new collections.CreepCollection();
    K.spawns = new collections.Collection();

    K.creeps.forEach(function (creep) {
      if (K.rooms.indexOf(creep.room) === -1) {
        // visible room
        K.rooms.add(creep.room);
        // visible hostiles
        var hostiles = creep.room.find(Game.HOSTILE_CREEPS);
        creep.room.hostileCount = hostiles.length;
        K.hostiles.addAll(hostiles);
        // visible spawns
        K.spawns.addAll(creep.room.find(Game.MY_SPAWNS));
      }
    });
  };

  return SetupGlobalObjectTask;

})();