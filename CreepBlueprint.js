module.exports = (function () {
  'use strict';

  var CreepCollection = require('CreepCollection');
  var utils = require('utils');

  function CreepBlueprint(name, type, bodies, factory) {
    this.name = name;
    this.type = type;
    this.typereg = new RegExp(name, 'i');
    this.bodies = bodies;
    this.cost = utils.sumBodyParts(this.bodies);
    factory.keys.push(name.toUpperCase());
  }

  CreepBlueprint.prototype.create = function (spawn) {
    return (spawn || utils.getDefaultSpawn()).createCreep(this.bodies, this.getNextName(), { type: this.type });
  };

  CreepBlueprint.prototype.getNextName = function () {
    for (var index = 1, len = this.getMaxCount(); index <= len; index++) {
      if (!Game.creeps[this.name + index]) {
        if (Memory.creeps[this.name + index]) {
          delete Memory.creeps[this.name + index];
        }
        return this.name + index;
      }
    }
    return null;
  };

  CreepBlueprint.prototype.getChildren = function () {
    var out = new CreepCollection(), creep, maxCount = this.getMaxCount();
    for (var name in Game.creeps) {
      creep = Game.creeps[name];
      if (creep && creep.memory.type === this.type) {
        out.add(creep);
      }
    }
    return out;
  };

  CreepBlueprint.prototype.getMaxCount = function () {
    return Memory.CreepBlueprint[this.name].maxCount;
  };

  CreepBlueprint.prototype.fill = function () {
    var
      index = this.getChildren().size(),
      len = this.getMaxCount(),
      spawn = utils.getDefaultSpawn();
    if (index < len && !spawn.spawning) {
      this.create();
    }
    return index === len;
  };

  CreepBlueprint.prototype.toString = function () {
    return this.name + '[' + this.bodies.join(',') + ']';
  };

  return CreepBlueprint;
})();