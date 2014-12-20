module.exports = (function () {
  'use strict';

  var CreepCollection = require('CreepCollection');
  var utils = require('utils');
  var Exceptions = require('Exceptions');
  var Storage = require('StorageElement');
  var RoomAnalyzer = require('RoomAnalyzer');

  function CreepBlueprint(name) {
    this.name = name;
    this.type = name.toLowerCase();
    this.storage = Storage.get('blueprints.' + this.type);
    this.bodyparts = this.storage.get('bodyparts');
    this.rooms = {};
  }

  CreepBlueprint.prototype.create = function create(spawn) {
    var
      nextName = this.getNextName(),
      creepName,
      energyStorages = RoomAnalyzer.getRoom(spawn.room).analyze(RoomAnalyzer.TYPE_ENERGY_STORAGES).energyStorages,
      body = [];
    spawn = spawn || utils.getDefaultSpawn();

    if (body = this.getAllowedBodyParts(spawn)) {
      console.log('try to spawn ' + this.type + '["' + body.join('", "') + '"], size: ' + body.length);
      creepName = spawn.createCreep(body, nextName, { type: this.type });
      if (typeof creepName === 'number') {
        console.log('errSpawnCreep(' + String(nextName) + ', ' + Exceptions[creepName].errMessage + ')');
        return null;
      }
    }
    return Game.creeps[creepName];
  };

  CreepBlueprint.prototype.getAllowedBodyParts = function getAllowedBodyParts(spawn) {
    var analysis = RoomAnalyzer.getRoom(spawn.room).analyze(RoomAnalyzer.TYPE_EXTENSIONS | RoomAnalyzer.TYPE_ENERGY_STORAGES);
    var extensionsCount = analysis.extensions.count;
    var maxEnergyToSpend = Math.min(analysis.energyStorages.extensionsTotalEnergy, analysis.energyStorages.extensionsTotalEnergyCapacity / 4);
    var extendedBodyParts = this.bodyparts.slice(5, extensionsCount);
    while (utils.sumBodyParts(extendedBodyParts) > maxEnergyToSpend) {
      extendedBodyParts.pop();
    }
    // if (energyStorages.extensionsTotalEnergyCapacity === 0 || energyStorages.extensionsTotalEnergy > energyStorages.extensionsTotalEnergyCapacity * 0.5)
    return this.bodyparts.slice(0, 5 + extendedBodyParts.length);
  };

  CreepBlueprint.prototype.getNextName = function getNextName() {
    for (var index = 0, len = Object.keys(Game.creeps).length; index <= len; index++) {
      if (!Game.creeps[this.name + index]) {
        if (Memory.creeps[this.name + index]) {
          delete Memory.creeps[this.name + index];
        }
        return this.name + index;
      }
    }
    return null;
  };

  /**
   * get all creep which are created with this blueprint
   * @return {CreepCollection}
  **/
  CreepBlueprint.prototype.getChildren = function getChildren() {
    var out = new CreepCollection(), creep;
    for (var name in Game.creeps) {
      creep = Game.creeps[name];
      if (creep && creep.memory.type === this.type) {
        out.add(creep);
      }
    }
    return out;
  };

  CreepBlueprint.prototype.getChildrenInRoom = function getChildrenInRoom(room) {
    if (this.rooms[room.name + 'Children']) return this.rooms[room.name + 'Children'];
    var
      out = new CreepCollection(),
      creep, creeps = room.find(Game.MY_CREEPS),
      index = -1, len = creeps.length;
    while (++index < len) {
      creep = creeps[index];
      if (creep && creep.memory.type === this.type) {
        out.add(creep);
      }
    }
    this.rooms[room.name + 'Children'] = out.clone();
    return out;
  };

  CreepBlueprint.prototype.getMaxCount = function getMaxCount() {
    return this.storage.get('maxCount');
  };

  CreepBlueprint.prototype.toString = function toString() {
    return this.name + '[' + this.type + ']';
  };

  return CreepBlueprint;
})();