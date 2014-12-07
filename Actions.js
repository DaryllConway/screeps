module.exports = (function () {
  'use strict';

  var Actions = {};
  var RoomAnalyzer = require('RoomAnalyzer');
  var Storage = require('StorageElement');

  function getFirstFilledCollection(/* collection1, collection2, collection2, ... */) {
    for (var index in arguments) {
      if (arguments[index]) {
        if (arguments[index].size()) return arguments[index];
      }
    }
  }

  function setTargetTo(creep, type, target) {
    if (target) {
      Storage.get('assignations.' + type + '.' + target.id).push(creep.name);
      creep.memory.target = target.id;
    }
    creep.target = target;
  }

  function getNextTargetIn(storage) {
    var
      minKey, minValue = Number.MAX_VALUE,
      keys = storage.keys(),
      nextAssignation = null;
    if (keys.length) {
      keys.forEach(function (key) {
        if (storage.get(key).length < minValue) {
          minValue = storage.get(key).length;
          minKey = key;
        }
      });
      nextAssignation = Game.getObjectById(minKey);
    }
    return nextAssignation;
  }

  function getTargetOf(creep, storage) {
    var
      storageKeys = storage.keys(),
      resultIndex, result;
    if (creep.memory.target && (result = Game.getObjectById(creep.memory.target))) {
      return result;
    }

    for (var index = 0, len = storageKeys.length; index < len; index++) {
      if ((resultIndex = storage.findInArray(storageKeys[index], creep.name)) > -1) {
        creep.memory.target = storageKeys[index];
        return Game.getObjectById(storageKeys[index]);
      }
    }
    return null;
  }

  Actions.harvest = function harvest() {
    var nearestEnergyStorage, energyStorages, energyStorageAnalyze, analyzer,
      harvesterStorage = Storage.get('assignations.harvester');

    if (this.spawning) return;

    this.target = getTargetOf(this, harvesterStorage);

    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available
      setTargetTo(this, 'harvester', getNextTargetIn(harvesterStorage));
    }

    if (this.energy === this.energyCapacity) {
      // find the nearest filled energy storage to the target or me
      // and transferEnergy from me
      // if no energyStorage next to me, wait
      analyzer = RoomAnalyzer.getRoom(this.room.name)
      energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;

      if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.empty, energyStorageAnalyze.nearEmpty, energyStorageAnalyze.others, energyStorageAnalyze.nearFull)) {
        nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
      }

      if (!nearestEnergyStorage) return;
      this.moveTo(nearestEnergyStorage);
      this.transferEnergy(nearestEnergyStorage);
      return;
    }

    this.moveTo(this.target);
    this.harvest(this.target);
  };

  Actions.build = function build() {
    var analyzer, nearestEnergyStorage, energyStorages, energyStorageAnalyze,
      builderStorage = Storage.get('assignations.builder');

    if (this.spawning) return;

    this.target = getTargetOf(this, builderStorage);

    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available
      setTargetTo(this, 'builder', getNextTargetIn(builderStorage));
    }

    if (this.energy === 0) {
      // find the nearest filled energy storage to the target or me
      // and transferEnergy to me
      // if no energyStorage next to me, wait
      analyzer = RoomAnalyzer.getRoom(this.room.name)
      energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;

      if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.filled.merge(energyStorageAnalyze.nearFull), energyStorageAnalyze.others)) {
        nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
      }

      if (!nearestEnergyStorage) return;

      this.moveTo(nearestEnergyStorage);
      nearestEnergyStorage.transferEnergy(this);
      return;
    }

    if (!this.target) return;
    this.moveTo(this.target);
    this.build(this.target);

  };

  return Actions;
})();