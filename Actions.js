var Actions = module.exports = {};
var utils = require('utils');

Actions.harvest = function harvest(creeps) {
  'use strict';
  var rooms = {}, currentroom,
    work = utils.getDefaultSpawn().energy !== utils.getDefaultSpawn().energyCapacity;
  creeps.forEach(function (creep) {
    if (creep.spawning) {
      return;
    }
    var site = creep.room.find(Game.SOURCES)[creeps.indexOf(creep) % 4];
    if (!work) {
      creep.moveTo(site);
      return;
    }
    if (creep.energy === creep.energyCapacity) {
      creep.moveTo(utils.getDefaultSpawn());
      creep.transferEnergy(utils.getDefaultSpawn());
      return;
    }

    if (site) {
      creep.moveTo(site);
      creep.harvest(site);
    }
  });
};
Actions.build = function build(creeps) {
  'use strict';
  var rooms = {}, currentroom;
  creeps.forEach(function (creep) {
    if (creep.energy === 0) {
      var spawn = utils.getDefaultSpawn();
      if (spawn.energy >= creep.energyCapacity) {
        creep.moveTo(spawn);
        spawn.transferEnergy(creep);
      }
      return;
    }
    if (!rooms[creep.room.name]) {
      rooms[creep.room.name] = {
        sites: creep.room.find(Game.CONSTRUCTION_SITES),
        index: 0
      };
    }
    currentroom = rooms[creep.room.name];
    if (currentroom.index >= currentroom.sites.length) {
      currentroom.index = 0;
    }
    creep.moveTo(currentroom.sites[currentroom.index]);
    creep.build(currentroom.sites[currentroom.index]);
    currentroom.index += 1;
  });
};
