module.exports = (function () {
  'use strict';

  var Actions = {};
  var RoomAnalyzer = require('RoomAnalyzer');
  var Storage = require('StorageElement');
  var Exceptions = require('Exceptions');

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
      creep.memory.nextDirection = null;
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

  function findPathTo(from, to) {
    var path = from.findPathTo(to, { maxOps: 200 });
    if (!path.length || !to.equalsTo(path[path.length - 1])) {
      path = from.findPathTo(to, { maxOps: 1000 });
    }
    return !path.length || !to.equalsTo(path[path.length - 1]) ? [] : path;
  }

  function moveTo(targetedPosition, toDo) {
    var actionResult, nextDirection;
    if (!this.memory.nextDirection || this.pos.inRangeTo(targetedPosition, 4)) {
      // update nextDirection if the creep haven't any one
      // or if it's next to the target
      nextDirection = findPathTo(this.pos, targetedPosition).map(function (path) { return path.direction; });
      if (!nextDirection.length) return;
      this.memory.nextDirection = nextDirection;
    }
    if (this.fatigue === 0 && this.memory.nextDirection.length) {
      actionResult = this.move(this.memory.nextDirection[0]);
      if (actionResult === Game.OK) {
        this.memory.nextDirection.shift();
      } else {
        console.log('errMoving(' + this.name + ', ' + Exceptions[actionResult].errMessage + ')');
      }
    }
    if (!this.memory.nextDirection.length) {
      this.memory.nextDirection = null;
    }
  }

  Actions.harvest = function harvest() {
    var nearestEnergyStorage, energyStorages,
      energyStorageAnalyze, analyzer, nextEnergyStorage,
      transferingResult, actionResult,
      harvesterStorage = Storage.get('assignations.worker');

    if (this.spawning) return;

    this.target = getTargetOf(this, harvesterStorage);

    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available
      setTargetTo(this, 'worker', getNextTargetIn(harvesterStorage));
    }

    if (this.energy === this.energyCapacity) {
      if (!this.memory.nextEnergyStorageId) {
        // find the nearest filled energy storage to the target or me
        // and transferEnergy from me
        // if no energyStorage next to me, wait
        analyzer = RoomAnalyzer.getRoom(this.room.name)
        energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;

        if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.empty, energyStorageAnalyze.nearEmpty, energyStorageAnalyze.others, energyStorageAnalyze.nearFull)) {
          nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
        }
        if (!nearestEnergyStorage) {
          // move away
          if (!this.pos.inRangeTo(this.target.pos, 3)) {
            moveTo.call(this, this.target.pos);
          }
          return;
        }
        this.memory.nextDirection = null;
        this.memory.nextEnergyStorageId = nearestEnergyStorage.id;
      }
      nextEnergyStorage = Game.getObjectById(this.memory.nextEnergyStorageId);

      if (nextEnergyStorage.energy === nextEnergyStorage.energyCapacity) return;

      if (this.pos.inRangeTo(nextEnergyStorage.pos, 1)) {
        // transferEnergy to EnergyContainer
        actionResult = this.transferEnergy(nextEnergyStorage);
        if (actionResult !== Game.OK) {
          console.log('errTransfering(' + this.name + ', ' + Exceptions[actionResult].errMessage + ')');
        }
      } else {
        // move
        moveTo.call(this, nextEnergyStorage.pos);
      }
      if (this.energy === 0) this.memory.nextEnergyStorageId = null;
      return;
    }

    if (!this.target) return;
    if (this.pos.inRangeTo(this.target.pos, 1)) {
      // harvest
      actionResult = this.harvest(this.target);
      if (actionResult !== Game.OK) {
        console.log('errBuilding(' + this.name + ', ' + Exceptions[actionResult].errMessage + ')');
      }
      return;
    }
    moveTo.call(this, this.target.pos);
  };

  Actions.build = function build() {
    var analyzer, nearestEnergyStorage, energyStorages, energyStorageAnalyze,
      actionResult,
      builderStorage = Storage.get('assignations.builder'), nextEnergyStorage;

    if (this.spawning) return;

    this.target = getTargetOf(this, builderStorage);

    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available
      setTargetTo(this, 'builder', getNextTargetIn(builderStorage));
    }

    if (this.energy === 0) {
      if (!this.memory.nextEnergyStorageId) {
        // find the nearest filled energy storage to the target or me
        // and transferEnergy to me
        // if no energyStorage next to me, wait
        analyzer = RoomAnalyzer.getRoom(this.room.name)
        energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;

        if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.filled.merge(energyStorageAnalyze.nearFull), energyStorageAnalyze.others)) {
          nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
        }

        if (!nearestEnergyStorage) {
          if (this.target && !this.pos.inRangeTo(this.target.pos, 3)) {
            moveTo.call(this, this.target.pos);
          }
          return;
        }
        this.memory.nextDirection = null;
        this.memory.nextEnergyStorageId = nearestEnergyStorage.id;
      }
      nextEnergyStorage = Game.getObjectById(this.memory.nextEnergyStorageId);

      if (this.pos.inRangeTo(nextEnergyStorage.pos, 1)) {
        this.memory.nextDirection = null;
        actionResult = nextEnergyStorage.transferEnergy(this);
        if (actionResult !== Game.OK) {
          console.log('errTransfering(' + this.name + ', ' + Exceptions[actionResult].errMessage + ')');
        }
      } else {
        // move
        moveTo.call(this, nextEnergyStorage.pos);
      }
      if (this.energy === this.energyCapacity) this.memory.nextEnergyStorageId = null;
      return;
    }

    if (!this.target) return;
    if (this.pos.inRangeTo(this.target.pos, 1)) {
      // build
      actionResult = this.build(this.target);
      if (actionResult !== Game.OK) {
        console.log('errBuilding(' + this.name + ', ' + Exceptions[actionResult].errMessage + ')');
      }
    } else {
      // move
      moveTo.call(this, this.target.pos);
    }

  };

  return Actions;
})();