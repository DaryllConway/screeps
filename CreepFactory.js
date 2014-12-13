module.exports = (function () {
  'use strict';

  var CreepBlueprint = require('CreepBlueprint');
  var K = require('K');
  var RoomAnalyzer = require('RoomAnalyzer');

  function CreepFactory() {
    this.keys = ['WORKER', 'BUILDER', 'TRANSPORTER'];
    this.WORKER  = new CreepBlueprint('Worker');
    this.BUILDER = new CreepBlueprint('Builder');
    this.TRANSPORTER = new CreepBlueprint('Transporter');
    // this.SCOUT   = new CreepBlueprint('Scout');
    this.methods = this.keys.map((function (type) {
      return this['spawn' + String(type.charAt(0).toUpperCase() + type.substr(1, type.length).toLowerCase()) + 'Into'];
    }).bind(this));
  }

  CreepFactory.prototype.spawnWorkerInto = function spawnWorkerInto(spawn) {
    var analysis = RoomAnalyzer.getRoom(spawn.room).analyze(RoomAnalyzer.TYPE_SPAWNS | RoomAnalyzer.TYPE_SOURCES);
    if (this.WORKER.getChildrenInRoom(spawn.room).size() < analysis.energySources.count * this.WORKER.getMaxCount()) {
      if (Memory.debugMode) console.log('spawn worker');
      this.WORKER.create(spawn);
      return true;
    }
    return false;
  };

  CreepFactory.prototype.spawnTransporterInto = function spawnTransporterInto(spawn) {
    if (this.TRANSPORTER.getChildrenInRoom(spawn.room).size() < this.WORKER.getChildrenInRoom(spawn.room).size() * this.TRANSPORTER.getMaxCount()) {
      if (Memory.debugMode) console.log('spawn transporter');
      this.TRANSPORTER.create(spawn);
      return true;
    }
    return false;
  };

  CreepFactory.prototype.spawnBuilderInto = function spawnBuilderInto(spawn) {
    if (this.BUILDER.getChildrenInRoom(spawn.room).size() < this.BUILDER.getMaxCount()) {
      if (Memory.debugMode) console.log('spawn builder');
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