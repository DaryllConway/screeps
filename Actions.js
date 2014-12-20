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
    // TODO: check the ignore and avoid param
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

  function getMaxEnergyToTransfer(from, to) {
    return to.energyCapacity - to.energy > from.energy ? from.energy : to.energyCapacity - to.energy;
  }

  function transporterFindBuilder(range) {
    return CreepFactory.BUILDER.getChildrenInRoom(this.room)
      .filter(function (creep) {
        return creep.memory.target && !creep.memory.nextTransporterId
          && (range === 0 || this.pos.inRangeTo(creep.pos, range));
      }, this).findClosest(this.pos);
  }

  function transporterFindTransporter() {
    if (!this.memory.nextEnergyStorageId) return null;
    var myStorageId = this.memory.nextEnergyStorageId;
    var myDistanceToEnergyStorage = findPathTo(this.pos, Game.getObjectById(myStorageId).pos).length;
    if (myDistanceToEnergyStorage < 3) return null;
    return CreepFactory.TRANSPORTER.getChildrenInRoom(this.room)
      .filter(function (creep) {
        var creepDistanceToEnergyStorage;
        if (this !== creep && this.memory.target === creep.memory.target /* same targeted worker's source */ && creep.memory.state === STATE_GOTO_WORKER && !creep.memory.nextTransporterId) {
          creepDistanceToEnergyStorage = findPathTo(creep.pos, Game.getObjectById(myStorageId).pos).length;
          return creepDistanceToEnergyStorage !== 0 && myDistanceToEnergyStorage !== 0
            && (
              this.energy > 0 && creep.energy === 0 && creepDistanceToEnergyStorage < myDistanceToEnergyStorage ||
              this.energy === 0 && creep.energy > 0 && myDistanceToEnergyStorage < creepDistanceToEnergyStorage
            );
        }
        return false;
      }, this).first();
  }

  function giveEnergy(from, to) {
    var exchange;
    if (from.memory.state === STATE_GOTO_WORKER && to.memory.state === STATE_GOTO_STORAGE) {
      exchange = to;
      to = from;
      from = exchange;
    }
    return from.transferEnergy(to, Math.min(from.energy, to.energyCapacity - to.energy));
  }

  var
    STATE_GOTO_STORAGE = "storage",
    STATE_GOTO_WORKER = "worker";

  function inverseState(memory) {
    return (memory.state = (memory.state === STATE_GOTO_WORKER ? STATE_GOTO_STORAGE : STATE_GOTO_WORKER));
  }
  function cancelTransport(transporter1, transporter2) {
    transporter1.memory.nextDirection = transporter2.memory.nextDirection = transporter1.memory.nextTransporterId = transporter2.memory.nextTransporterId = null;
  }

  /**
   *
   *
  **/
  Actions.transport = function transport() {
    // Transport is only between them and worker to storage
    var
      mem = this.memory,
      transporterStorage = Storage.get('assignations.transporter'),
      workerStorage, actionResult,
      destinationObject, nextPathToOther, nearestOne,
      workersInRange, countTransfered = 0,
      analyzer, energyStorageAnalyze, energyStorages, nearestEnergyStorage;
    if (this.spawning) return;

    this.target = getTargetOf(this, transporterStorage);
    if (!mem.state) inverseState(mem);
    if (!this.target || !Game.getObjectById(this.target.id)) {
      setTargetTo(this, 'transporter', getNextTargetIn(transporterStorage));
    }

    if (mem.state === STATE_GOTO_STORAGE && !mem.nextEnergyStorageId) {
      // Goto energy storage && dont know which of them
      // find the nearest filled energy storage to the target or me
      analyzer = RoomAnalyzer.getRoom(this.room.name);
      energyStorageAnalyze = analyzer.analyze(RoomAnalyzer.TYPE_ENERGY_STORAGES).energyStorages;

      if (energyStorages = getFirstFilledCollection(energyStorageAnalyze.empty, energyStorageAnalyze.nearEmpty, energyStorageAnalyze.others, energyStorageAnalyze.nearFull)) {
        nearestEnergyStorage = energyStorages.findClosest(this.target ? this.target.pos : this.pos);
      }
      if (nearestEnergyStorage) {
        mem.nextEnergyStorageId = nearestEnergyStorage.id;
      }
    }

    if (mem.state === STATE_GOTO_STORAGE && !mem.nextTransporterId) {
      // Goto energy storage && dont have transporter to collect its energy
      nearestOne = transporterFindTransporter.call(this);
      if (nearestOne) {
        mem.nextTransporterId = nearestOne.id;
        nearestOne.memory.nextTransporterId = this.id;
        nearestOne.memory.nextEnergyStorageId = mem.nextEnergyStorageId;
        // reset their nextDirection cache
        mem.nextDirection = nearestOne.memory.nextDirection = null;
      }
    }

    // move relativly to state
    if (mem.nextTransporterId) {
      // meet another transporter
      destinationObject = Game.getObjectById(mem.nextTransporterId);
      if (destinationObject && destinationObject.memory.state !== mem.state) {
        if (this.pos.inRangeTo(destinationObject.pos, 1)) {
          giveEnergy(this, destinationObject);
          cancelTransport(this, destinationObject);
          inverseState(mem);
          inverseState(destinationObject.memory);
        } else {
          nextPathToOther = this.pos.findPathTo(destinationObject.pos, { maxOps: 400, ignoreDestructibleStructures: true, ignoreCreeps: true })[0];
          if (nextPathToOther) this.move(nextPathToOther.direction);
        }
        return;
      } else if (destinationObject) {
        cancelTransport(this, destinationObject)
      }
    }
    if (mem.nextEnergyStorageId && mem.state === STATE_GOTO_STORAGE) {
      destinationObject = Game.getObjectById(this.memory.nextEnergyStorageId);
      if (this.pos.inRangeTo(destinationObject.pos, 1)) {
        actionResult = this.transferEnergy(destinationObject, Math.min(this.energy, destinationObject.energyCapacity - destinationObject.energy));
        if (actionResult === Game.OK || !this.energy) {
          inverseState(mem);
          mem.lastTransport = 'energyStorage';
          mem.nextTransporterId = this.memory.nextDirection = null;
        }
      } else {
        moveTo.call(this, destinationObject.pos);
      }
      return;
    }
    if (this.target && mem.state === STATE_GOTO_WORKER) {
      if (this.pos.inRangeTo(this.target.pos, 2)) {
        workerStorage = Storage.get('assignations.worker');
        workersInRange = this.target.pos.findInRange(workerStorage.get(this.target.id).map(function (creepName) { return Game.creeps[creepName]; }), 1);
        for (var index in workersInRange) {
          countTransfered += workersInRange[index].transferEnergy(this, workersInRange[index].energyCapacity) === Game.OK ? 1 : 0;
        }
        if (countTransfered > 0) {
          inverseState(mem);
          mem.nextEnergyStorageId = mem.nextTransporterId = mem.nextDirection = null;
        }
      } else {
        moveTo.call(this, this.target.pos);
      }
    }
  };

  Actions.harvest = function harvest() {
    var
      harvesterStorage = Storage.get('assignations.worker'),
      spawn;

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
    var  builderStorage = Storage.get('assignations.builder');

    if (this.spawning) return;

    this.target = getTargetOf(this, builderStorage);
    if (!this.target || !Game.getObjectById(this.target.id)) {
      // if the target is no longer available
      setTargetTo(this, 'builder', getNextTargetIn(builderStorage));
    }

    if (!this.target) return;
    if (this.pos.inRangeTo(this.target.pos, 1)) {
      if (!this.energy && (spawn = this.pos.findInRange(Game.MY_SPAWNS, 1)[0])) spawn.transferEnergy(this) ;
      if (this.energy > 0) this.build(this.target);
      return;
    }
    moveTo.call(this, this.target.pos);
  };

  return Actions;
})();