module.exports = (function () {
  'use strict';

  var utils = require('utils');
  var CreepBlueprint = require('CreepBlueprint');

  function CreepFactory() {
    this.keys = [];
    this.WORKER  = new CreepBlueprint("Worker" , 1, [Game.MOVE, Game.MOVE, Game.MOVE, Game.CARRY, Game.WORK], this);
    this.BUILDER = new CreepBlueprint("Builder", 2, [Game.MOVE, Game.CARRY, Game.CARRY, Game.WORK, Game.WORK], this);
    this.SCOUT   = new CreepBlueprint("Scout"  , 4, [Game.MOVE, Game.MOVE, Game.MOVE, Game.MOVE], this);
  }

  CreepFactory.prototype.tryToFillAll = function () {
    var key, spawn = utils.getDefaultSpawn();
    for (var index = 0; index < this.keys.length; index++) {
      key = this.keys[index];
      if (spawn.spawning) {
        return;
      }
      if (this[key].getChildren().size() < this[key].getMaxCount()) {
        return this[key].create();
      }
    }
  };

  return new CreepFactory();
})();