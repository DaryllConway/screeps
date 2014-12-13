module.exports = (function () {
  'use strict';

  var CreepBlueprint = require('CreepBlueprint');
  var K = require('K');

  function CreepFactory() {
    this.keys = ['WORKER', 'BUILDER'];
    this.WORKER  = new CreepBlueprint('Worker');
    this.BUILDER = new CreepBlueprint('Builder');
    // this.SCOUT   = new CreepBlueprint('Scout');
    this.methods = this.keys.map((function (type) {
      return this['spawn' + String(type.charAt(0).toUpperCase() + type.substr(1, type.length).toLowerCase()) + 'Into'];
    }).bind(this));
  }

  CreepFactory.prototype.spawnWorkerInto = function spawnWorkerInto(spawn) {
    var sources = spawn.room.find(Game.SOURCES);
    if (this.WORKER.getChildrenInRoom(spawn.room).size() < sources.length * this.WORKER.getMaxCount()) {
      console.log('spawn worker');
      this.WORKER.create(spawn);
      return true;
    }
    return false;
  };

  CreepFactory.prototype.spawnBuilderInto = function spawnBuilderInto(spawn) {
    if (this.BUILDER.getChildrenInRoom(spawn.room).size() < this.BUILDER.getMaxCount()) {
      this.BUILDER.create(spawn);
      return true;
    }
    return false;
  };

  CreepFactory.prototype.spawnInto = function spawnInto(spawn) {
    if (spawn.spawning) return;
    for (var index = 0; index < this.methods.length; index++) {
      if (typeof this.methods[index] === 'function' && this.methods[index].call(this, spawn)) {
        // successful spawning
        return;
      }
    }
  };

  CreepFactory.prototype.spawnIntoRoom = function spawnIntoRoom(room) {
    var
      spawns = room.find(Game.SPAWNS),
      index = -1, len = spawns.length;
    while (++index < len) {
      this.spawnInto(spawns[index]);
    }
  };

  CreepFactory.prototype.spawn = function spawn() {
    K.spawns.forEach(this.spawnInto, this);
  };

  return new CreepFactory();
})();