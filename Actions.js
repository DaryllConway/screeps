module.exports = (function () {
  'use strict';

  var Actions = {};
  var utils = require('utils');
  var Collection = require('Collection');
  var K = require('K');

  Actions.harvest = function harvest(creep, index) {
    'use strict';
    var nearestSpawn, site, sources, spawns;
    if (creep.spawning) {
      return;
    }

    sources = creep.room.find(Game.SOURCES);
    site = sources[index % sources.length];

    spawns = new Collection(creep.room.find(Game.MY_SPAWNS));
    nearestSpawn = spawns.filter(function (spawn) {
      return spawn.energy < spawn.energyCapacity;
    }).findNearest(creep.pos);
    if (!site || !nearestSpawn) {
      creep.moveTo(utils.getDefaultSpawn());
      return;
    }

    if (creep.energy === creep.energyCapacity) {
      creep.moveTo(nearestSpawn);
      creep.transferEnergy(nearestSpawn);
      return;
    }

    creep.moveTo(site);
    creep.harvest(site);
  };
  Actions.build = function build(creep, index) {
    'use strict';
    var sites, site, spawns, nearestSpawn;
    if (creep.spawning) {
      return;
    }

    if (!creep.target || creep.energy === 0) {
      sites = creep.room.find(Game.CONSTRUCTION_SITES);
      site  = sites[index % sites.length];

      if (!site || creep.energy === 0) {
        spawns = new Collection(creep.room.find(Game.MY_SPAWNS));
        nearestSpawn = spawns.filter(function (spawn) {
          return spawn.energy > spawn.energyCapacity / 3;
        }).findNearest(creep.pos);
        if (!nearestSpawn) {
          if (Game.flags.BuilderPoint) creep.moveTo(Game.flags.BuilderPoint);
          return;
        }
        if (nearestSpawn) {
          if (!site) {
            if (creep.energy) {
              creep.moveTo(nearestSpawn);
              creep.transferEnergy(nearestSpawn);
            } else if (Game.flags.BuilderPoint) {
              creep.moveTo(Game.flags.BuilderPoint);
            }
          }
          else if (creep.energy === 0 && nearestSpawn.energy >= creep.energyCapacity) {
            creep.moveTo(nearestSpawn);
            nearestSpawn.transferEnergy(creep);
          }
          return;
        }
      } else {
        creep.target = site;
      }
    }
    creep.moveTo(creep.target);
    creep.build(creep.target);
  };

  return Actions;
})();