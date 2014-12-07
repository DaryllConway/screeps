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


    K.rooms = new collections.Collection();
    K.creeps = new collections.CreepCollection();

    Object.keys(Game.creeps).forEach(function (key) {
      var creep = Game.creeps[key];
      K.creeps.add(creep);
      K.rooms.add(creep.room);
    });

    // setup typed creep collections
    K.workers  = K.creeps.filter(function (value) { return value && value.memory.type === CreepFactory.WORKER.type });
    K.builders = K.creeps.filter(function (value) { return value && value.memory.type === CreepFactory.BUILDER.type });

    K.workers .assignAll({ 'behavior': Actions.harvest });
    K.builders.assignAll({ 'behavior': Actions.build   });
  };

  return SetupGlobalObjectTask;

})();