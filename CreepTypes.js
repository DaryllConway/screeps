var utils = require('utils');
var CreepCollection = require('CreepCollection');

module.exports = (function () {
  'use strict';

  function CreepType(name, type, bodies, parent) {
    this.name = name;
    this.type = type;
    this.typereg = new RegExp(name, 'i');
    this.bodies = bodies;
    this.cost = utils.sumBodyParts(this.bodies);
    parent.keys.push(name.toUpperCase());
  }

  CreepType.prototype.create = function(spawn) {
    return (spawn || utils.getDefaultSpawn()).createCreep(this.bodies, this.getNextName(), { type: this.type });
  };

  CreepType.prototype.getNextName = function () {
    for (var index = 1, len = this.getMaxCount(); index < len; index++) {
      if (!Game.creeps[this.name + index]) {
        if (Memory.creeps[this.name + index]) {
          delete Memory.creeps[this.name + index];
        }
        return this.name + index;
      }
    }
    return null;
  };

  CreepType.prototype.getChildren = function () {
    var out = new CreepCollection(), creep, maxCount = this.getMaxCount();
    for (var name in Game.creeps) {
      creep = Game.creeps[name];
      if (creep && out.length < maxCount && creep.memory.type === this.type) {
        out.push(creep);
      }
    }
    return out;
  };

  CreepType.prototype.getMaxCount = function () {
    return Memory.creepType[this.name].maxCount;
  };

  CreepType.prototype.fill = function () {
    var
      index = this.getChildren().length,
      len = this.getMaxCount(),
      spawn = utils.getDefaultSpawn();
    if (index < len && !spawn.spawning) {
      this.create();
    }
    return index === len;
  };

  CreepType.prototype.toString = function () {
    return this.name + '&lt;' + this.bodies.join(',') + '>';
  };

  function CreepTypes() {
    this.keys = [];
    this.WORKER  = new CreepType("Worker" , 1, [Game.MOVE, Game.MOVE, Game.MOVE, Game.CARRY, Game.WORK], this);
    this.BUILDER = new CreepType("Builder", 2, [Game.MOVE, Game.CARRY, Game.WORK, Game.WORK, Game.WORK], this);
    this.SCOUT   = new CreepType("Scout"  , 4, [Game.MOVE, Game.MOVE, Game.MOVE, Game.MOVE], this);
  }

  CreepTypes.prototype.tryToFillAll = function () {
    var key, spawn = utils.getDefaultSpawn();
    for (var index = 0; index < this.keys.length; index++) {
      key = this.keys[index];
      if (spawn.spawning) {
        return;
      }
      if (this[key].getChildren().length < this[key].getMaxCount()) {
        return this[key].create();
      }
    }
  };

  return new CreepTypes();
})();



