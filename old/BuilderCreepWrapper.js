(function () {
  'use strict';

  var CreepWrapper = require('CreepWrapper');
  var Storage = require('StorageElement');
  var RoomAnalyzer = require('RoomAnalyzer');

  function BuilderCreepWrapper(creep) {
    CreepWrapper.call(this, creep);
  }

  BuilderCreepWrapper.__super__ = CreepWrapper.prototype;
  BuilderCreepWrapper.prototype = Object.create(BuilderCreepWrapper.__super__);
  BuilderCreepWrapper.prototype.constructor = BuilderCreepWrapper;

  BuilderCreepWrapper.prototype.buildBehavior = function buildBehavior() {
    var analyzer, nearestEnergyStorage, energyStorages, energyStorageAnalyze,
      actionResult,
      builderAssignationStorage, nextEnergyStorage;
    if (this.spawning) return;

    if (!this.target) {
      this.target = this.getNextTarget(Storage.get('assignations.builder'));
    }

    if (this.energy === 0) {
      this.noMoreEnergyBehavior.call(this.creep);
    }
  };

  BuilderCreepWrapper.prototype.noMoreEnergyBehavior = function noMoreEnergyBehavior() {
    var analyzer, energyStorageAnalyze, energyStorages, nearestEnergyStorage, actionResult;
    if (!this.memory.nextEnergyStorageId) {
      // find the nearest filled energy storage to the target or me
      // and transferEnergy to me
      // if no energyStorage next to me, wait
      analyzer = RoomAnalyzer.getRoom(this.room.name);
      energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;
      if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.filled.merge(energyStorageAnalyze.nearFull), energyStorageAnalyze.others)) {
        nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
      }
      if (!nearestEnergyStorage) return;
      this.memory.nextDirection = null;
      this.memory.nextEnergyStorageId = nearestEnergyStorage.id;
    }
    nextEnergyStorage = Game.getObjectById(this.memory.nextEnergyStorageId);
    if (this.pos.inRangeTo(nextEnergyStorage.pos, 1)) {
      actionResult = nextEnergyStorage.transferEnergy(this);
      if (actionResult !== Game.OK) {
        console.log('errTransfering(' + actionResult + ')');
      }
    } else {
      // move to nextStorage id
      if (!this.memory.nextDirection) {
        this.memory.nextDirection = this.pos.findPathTo(nextEnergyStorage.pos, { maxOps: 200 })
          .map(function (path) { return path.direction; });
      }
      if (this.fatigue === 0 && this.memory.nextDirection.length) {
        actionResult = this.move(this.memory.nextDirection[0]);
        if (actionResult === Game.OK) {
          this.memory.nextDirection.shift();
        } else {
          console.log('errMoving(' + actionResult + ' to energy storage)');
        }
        if (!this.memory.nextDirection.length) {
          this.memory.nextDirection = null;
        }
      }
    }
  };

})();