module.exports = (function () {
  'use strict';

  var Actions = {};
  var RoomAnalyzer = require('RoomAnalyzer');
  var Storage = require('StorageElement');
  var Exceptions = require('Exceptions');
  var CreepCollection =  require('CreepCollection');
  var CreepFactory = require('CreepFactory');

  function getFirstFilledCollection(/* collection1, collection2, collection2, ... */) {
    for (var index in arguments) {
      if (arguments[index] && arguments[index].size()) return arguments[index];
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

  function transporterFindBuilder() {
    return CreepFactory.BUILDER.getChildrenInRoom(this.room)
      .filter(function (creep) {
        return creep.memory.target
          && !creep.memory.nextTransporterId
          && this.pos.inRangeTo(creep.pos, 15);
      }, this).findNearest(this.pos);
  }

  function transporterFindTransporter() {
    if (!this.memory.nextEnergyStorageId) return null;
    var myDistanceToEnergyStorage = findPathTo(this.pos, Game.getObjectById(this.memory.nextEnergyStorageId).pos).length;
    return CreepFactory.TRANSPORTER.getChildrenInRoom(this.room)
      .filter(function (creep) {
        if (!creep.memory.nextEnergyStorageId) return;
        var creepDistanceToEnergyStorage = findPathTo(creep.pos, Game.getObjectById(creep.memory.nextEnergyStorageId).pos).length;
        return this !== creep
          && this.memory.targetSource === creep.memory.targetSource /* same targeted worker's source */
          && this.memory.goTo !== creep.memory.goTo
          && !creep.memory.nextTransporterId
          && creepDistanceToEnergyStorage !== 0 && myDistanceToEnergyStorage !== 0
          && (
            this.energy === this.energyCapacity && creep.energy === 0 && creepDistanceToEnergyStorage < myDistanceToEnergyStorage ||
            this.energy === 0 && creep.energy === creep.energyCapacity && myDistanceToEnergyStorage < creepDistanceToEnergyStorage
          );
      }, this).first();
  }

  Actions.transport = function transport() {
    var nearestEnergyStorage, energyStorages,
      energyStorageAnalyze, analyzer,
      nearestOne, actionResult, transporterStorage = Storage.get('assignations.transporter');
    if (this.spawning) return;

    this.target = getTargetOf(this, transporterStorage);
    if (!this.target || !Game.getObjectById(this.target.id)) {
      setTargetTo(this, 'transporter', getNextTargetIn(transporterStorage));
      this.memory.targetSource = (Game.getObjectById(this.memory.target) /* targetd worker */).memory.target/* worker's target */;

    }

    // find the nearest filled energy storage to the target or me
    // and transferEnergy from me
    // if no energyStorage next to me, wait
    analyzer = RoomAnalyzer.getRoom(this.room.name);
    energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS | RoomAnalyzer.TYPE_EXTENSIONS).energyStorages;

    if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.empty, energyStorageAnalyze.nearEmpty, energyStorageAnalyze.others, energyStorageAnalyze.nearFull)) {
      nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
    }
    if (nearestEnergyStorage) {
      this.memory.nextEnergyStorageId = nearestEnergyStorage.id;
    }


    if (!this.memory.nextTransporterId) {
      // find the nearest creep empty with goTo === 'worker'
      if (this.memory.lastTransport !== 'builder' || (!nearestEnergyStorage || nearestEnergyStorage.energy === nearestEnergyStorage.energyCapacity)) {
        nearestOne = transporterFindBuilder.call(this);
      }
      if (!nearestOne && this.memory.lastTransport !== 'transporter') {
        nearestOne = transporterFindTransporter.call(this);
      }
      if (nearestOne) {
        this.memory.lastTransport = nearestOne.memory.type;
        // console.log('assign ' + this.name + '(' + this.energy + '/' + this.energyCapacity +' )' + ' with ' + nearestOne.name + '(' + nearestOne.energy + '/' + nearestOne.energyCapacity +')')
        this.memory.nextTransporterId = nearestOne.id;
        nearestOne.memory.nextTransporterId = this.id;
        this.memory.nextDirection = nearestOne.memory.nextDirection = null;
      }
    }

    var destinationObject;
    if (this.memory.nextTransporterId) {
      destinationObject = Game.getObjectById(this.memory.nextTransporterId);
      if (destinationObject && destinationObject.memory.goTo !== this.memory.goTo && (this.energy === this.energyCapacity && destinationObject.energy === 0 || this.energy === 0 && destinationObject.energy === destinationObject.energyCapacity)) {

        if (this.pos.inRangeTo(destinationObject.pos, 1)) {
          if (this.energy === this.energyCapacity) {
            if (this.energy > destinationObject.energyCapacity) {
              actionResult = this.transferEnergy(destinationObject, destinationObject.energyCapacity);
            } else {
              actionResult = this.transferEnergy(destinationObject);
              if (actionResult === Game.OK) {
                this.memory.goTo = 'worker';
              }
              if (destinationObject.memory.type === CreepFactory.TRANSPORTER.type) destinationObject.memory.goTo  = 'storage';
            }
          } else {
            actionResult = destinationObject.transferEnergy(this);
            if (actionResult === Game.OK) {
              this.memory.goTo = 'storage';
              destinationObject.memory.goTo = 'worker';
            }
          }
          if (actionResult !== Game.OK) {
            console.log('errTransferingToCreep(' + this.name + ' to ' + destinationObject.name + ', ' + Exceptions[actionResult].errMessage + ')');
          }
          this.memory.nextTransporterId = destinationObject.memory.nextTransporterId = destinationObject.memory.nextDirection = this.memory.nextDirection = null;
        } else if (this.fatigue === 0) {
          this.moveTo(destinationObject.pos);
        }
        return;
      } else {
        this.memory.nextTransporterId = this.memory.nextDirection = null;
        if (destinationObject) destinationObject.memory.nextTransporterId = destinationObject.memory.nextDirection = null;
      }
    }
    if (this.memory.nextEnergyStorageId && this.energy === this.energyCapacity) {
      destinationObject = Game.getObjectById(this.memory.nextEnergyStorageId);
      if (this.pos.inRangeTo(destinationObject.pos, 1)) {
        actionResult = this.transferEnergy(destinationObject, this.energy);
        if (actionResult === Game.OK) {
          this.memory.goTo = 'worker';
          this.memory.nextTransporterId = this.memory.nextDirection = null;
        }
      } else {
        moveTo.call(this, destinationObject.pos);
      }
      return;
    }
    if (this.target) {
      if (this.pos.inRangeTo(this.target.pos, 1)) {
        actionResult = this.target.transferEnergy(this);
        if (actionResult === Game.OK) {
          this.memory.goTo = 'storage';
          this.memory.nextEnergyStorageId = this.memory.nextTransporterId = this.memory.nextDirection = null;
        }
      } else {
        moveTo.call(this, this.target.pos);
      }
    }
  };

  Actions.harvest = function harvest() {
    var harvesterStorage = Storage.get('assignations.worker');

    if (this.spawning) return;

    this.target = getTargetOf(this, harvesterStorage);
    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available or empty
      setTargetTo(this, 'worker', getNextTargetIn(harvesterStorage));
    }

    if (this.energy === this.energyCapacity || !this.target) return;
    if (this.pos.inRangeTo(this.target.pos, 1)) {
      this.harvest(this.target);
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

    // if (this.energy === 0) {
    //   if (!this.memory.nextEnergyStorageId) {
    //     // find the nearest filled energy storage to the target or me
    //     // and transferEnergy to me
    //     // if no energyStorage next to me, wait
    //     analyzer = RoomAnalyzer.getRoom(this.room.name)
    //     energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_SPAWNS).energyStorages;

    //     if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.filled.merge(energyStorageAnalyze.nearFull), energyStorageAnalyze.others)) {
    //       nearestEnergyStorage = energyStorages.findNearest(this.target ? this.target.pos : this.pos);
    //     }

    //     if (!nearestEnergyStorage) {
    //       if (this.target && !this.pos.inRangeTo(this.target.pos, 3)) {
    //         moveTo.call(this, this.target.pos);
    //       }
    //       return;
    //     }
    //     this.memory.nextDirection = null;
    //     this.memory.nextEnergyStorageId = nearestEnergyStorage.id;
    //   }
    //   nextEnergyStorage = nearestEnergyStorage || Game.getObjectById(this.memory.nextEnergyStorageId);

    //   if (this.pos.inRangeTo(nextEnergyStorage.pos, 1)) {
    //     this.memory.nextDirection = null;
    //     nextEnergyStorage.transferEnergy(this);
    //   } else {
    //     // move
    //     moveTo.call(this, nextEnergyStorage.pos);
    //   }
    //   if (this.energy === this.energyCapacity) this.memory.nextEnergyStorageId = null;
    //   return;
    // }

    if (!this.target) return;
    if (this.pos.inRangeTo(this.target.pos, 1)) {
      if (this.energy > 0) this.build(this.target);
      return;
    }
    moveTo.call(this, this.target.pos);
  };

  return Actions;
})();