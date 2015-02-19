module.exports = (function () {
  'use strict';

  var
    Collection = require('Collection'),
    CreepCollection = require('creep/CreepCollection');

  return function () {
    return {
      spawn: {
        free: new Collection(),
        count: 0
      },
      energyStorages: {
        filled: new Collection(),
        empty: new Collection(),
        nearEmpty: new Collection(),
        nearFull: new Collection(),
        others: new Collection(),
        count: 0,
        totalEnergy: 0,
        totalEnergyCapacity: 0,
        extensionsTotalEnergy: 0,
        extensionsTotalEnergyCapacity: 0,
        spawnsTotalEnergy: 0,
        spawnsTotalEnergyCapacity: 0
      },
      energySources: {
        filled: new Collection(),
        empty: new Collection(),
        nearEmpty: new Collection(),
        nearFull: new Collection(),
        others: new Collection(),
        totalEnergy: 0,
        totalEnergyCapacity: 0,
        count: 0
      },
      constructions: {
        nearFull: new Collection(),
        nearEmpty: new Collection(),
        empty: new Collection(),
        others: new Collection()
      },
      structures: {
        damaged: new Collection(),
        count: 0
      },
      extensions: {
        count: 0
      },
      creeps: {
        workers: new CreepCollection(),
        builder: new CreepCollection(),
        full: new CreepCollection(),
        damaged: new CreepCollection(),
        nearDeath: new CreepCollection(),
        count: 0
      },
      hostiles: {
        creeps: {
          full: new CreepCollection(),
          damaged: new CreepCollection(),
          nearDeath: new CreepCollection(),
          count: 0
        },
        structures: {
          damaged: new Collection(),
          count: 0
        },
        constructions: {
          all: new Collection(),
          nearFull: new Collection(),
          nearEmpty: new Collection(),
          empty: new Collection(),
          others: new Collection()
        }
      }
    };
  };
})();