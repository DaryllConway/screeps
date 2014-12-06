var utils = require('utils');

function setupDefaultMemory() {
  Memory.CreepBlueprint = {
    Worker : { maxCount: 5 },
    Builder: { maxCount: 3 },
    Scout  : { maxCount: 0 }
  };
  Memory.lastPainfulActions = 0;
  Memory.painfulActionDelta = 0.5 * 60 * 1000;
  Memory.creeps = {};
  Memory.spawns = utils.valuesOf(Game.spawns).map(function (spawn) {
    return spawn.name;
  });
}

function isBuildable(look) {
  for (var index = 0; index < look.length; index++) {
    if (/source|structure|exit/.test(look[index].type) || /wall/.test(look[index].terrain)) {
      return false;
    }
  }
  return true;
}

function lookContains(look, type) {
  for (var index = 0; index < look.length; index++) {
    if (look[index].type === 'structure' && look[index].structure.structureType === type) {
      return true;
    }
  }
  return false;
}

function createRoad(from, to) {
  var room = Game.getRoom(from.pos.roomName), isBuilding = false;
  if (room !== Game.getRoom(to.pos.roomName)) {
    return false;
  }
  var path = from.pos.findPathTo(to, { ignoreCreeps: true, ignoreDestructibleStructures: true, maxOps: 200 });
  path.forEach(function (pos) {
    var look = room.lookAt(pos);
    if (!lookContains(look, Game.STRUCTURE_ROAD) && isBuildable(look)) {
      room.createConstructionSite(pos, Game.STRUCTURE_ROAD);
      isBuilding = true;
    }
  });
  return isBuilding;
}
function containsSitesType(sites, type) {
  var index = -1;
  while (++index < sites.length) {
    if (sites[index].structureType === type) {
      return true;
    }
  }
  return false;
}

function createRoads() {
  var spawns = utils.valuesOf(Game.spawns);
  var
    indexSpawnLoop1 = -1, indexSpawnLoop2, indexSourcesLoop,
    spawn, otherSpawn, sources, source;
  while (++indexSpawnLoop1 < spawns.length) {
    spawn = spawns[indexSpawnLoop1];
    if (!containsSitesType(spawn.room.find(Game.CONSTRUCTION_SITES), Game.STRUCTURE_ROAD)) {

      // build road between 2 spawns
      indexSpawnLoop2 = -1;
      while (++indexSpawnLoop2 < spawns.length) {
        if (indexSpawnLoop1 !== indexSpawnLoop2) {
          otherSpawn = spawns[indexSpawnLoop2];
          if (createRoad(spawn, otherSpawn)) {
            // only create one road
            return;
          }
        }
      }

      // build road between spawns-source
      indexSourcesLoop = -1;
      sources = spawn.room.find(Game.SOURCES);
      while (++indexSourcesLoop < sources.length) {
        source = sources[indexSourcesLoop];
        if (createRoad(spawn, source)) {
          return;
        }
      }
    }
  }
}

function createConstructionSites() {
  createRoads();
}

module.exports = function () {
  var K = require('K');
  var collections = require('collections');
  // I know this is bad, but sometimes a little monkey patch could be helpful =D
  if (!Array.prototype.first) {
    Array.prototype.first = function () { return this[0]; };
    Array.prototype.last = function () { return this[this.length - 1]; };
  }
  if (!Memory.CreepBlueprint) setupDefaultMemory();

  K.creeps = new collections.CreepCollection();
  K.creeps.children = utils.valuesOf(Game.creeps);

  K.rooms = new collections.Collection();
  K.hostiles = new collections.CreepCollection();
  K.spawns = new collections.Collection();
  // Scan rooms where creeps are to detect all hostiles
  K.creeps.forEach(function (creep) {
    if (K.rooms.indexOf(creep.room) === -1) {
      K.rooms.add(creep.room);
      var hostiles = creep.room.find(Game.HOSTILE_CREEPS);
      K.spawns.addAll(creep.room.find(Game.MY_SPAWNS));
      creep.room.hostileCount = hostiles.length;
      K.hostiles.addAll(hostiles);
    }
  });

  // if (Date.now() - Memory.lastPainfulActions > Memory.painfulActionDelta) {
  //   createConstructionSites();
  //   Memory.lastPainfulActions = Date.now();
  // }

  return {
    initialized: true
  };
};