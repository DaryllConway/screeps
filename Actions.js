module.exports = (function () {
  'use strict';

  var Actions = {};
  var utils = require('utils');
  var Collection = require('Collection');
  var K = require('K');

  Actions.harvest = function harvest(creep, index) {
    'use strict';
    var nearestSpawn, site, sources;
    if (creep.spawning) {
      return;
    }

    sources = creep.room.find(Game.SOURCES);
    site = sources[index % sources.length];
    nearestSpawn = K.emptySpawn.findNearest(creep.pos);
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
    var sites, site, nearestSpawn;
    if (creep.spawning) {
      return;
    }
    sites = creep.room.find(Game.CONSTRUCTION_SITES);
    site  = sites[index % sites.length];

    if (!site || creep.energy === 0) {
      nearestSpawn = (K.fullSpawn.size() > 0 ? K.fullSpawn : K.emptySpawn).findNearest(creep.pos);
      if (nearestSpawn.energy < nearestSpawn.energyCapacity / 6) {
        nearestSpawn = (new Collection(creep.room.find(Game.MY_SPAWNS))).desc('energy').first();
        if (nearestSpawn.energy < nearestSpawn.energyCapacity / 6)
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
    }

    creep.moveTo(site);
    creep.build(site);
  };

  return Actions;
})();