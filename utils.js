module.exports = (function () {
  'use strict';

  function getDefaultSpawn() {
    return Game.spawns[Memory.spawns.first()];
  }
  function sumBodyParts(bodyparts) {
    var sum = 0;
    for (var index in bodyparts) {
      sum += utils.bodyparts[bodyparts[index]] || 0;
    }
    return sum;
  }

  function isLitteralObject(value) {
    return value !== null && typeof value !== 'undefined' && value.constructor === Object;
  }

  function getObjectValues(object) {
    var out = [], keys = Object.keys(object);
    for (var index = 0; index < keys.length; index++) {
      out.push(object[keys[index]]);
    }
    return out;
  }

  function clone(object) {
    var other = {}, index = -1, keys = Object.keys(object), key, value;
    while (++index < keys.length) {
      key = keys[index];
      value = object[key];
      if (isLitteralObject(value)) {
        other[key] = clone(value);
      } else {
        other[key] = value;
      }
    }
    return other;
  }

  function updateMemory() {
    Memory.spawns = getObjectValues(Game.spawns).map(function (spawn) {
      return spawn.name;
    });
    Object.keys(Memory.creeps).forEach(function (creepName) {
      if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
      }
    });
  }

  var utils = {
    "getDefaultSpawn" : getDefaultSpawn,
    "sumBodyParts"    : sumBodyParts,
    "clone"           : clone,
    "isLitteralObject": isLitteralObject,
    "valuesOf"        : getObjectValues,
    "updateMemory"    : updateMemory,
    "bodyparts"       : {}
  };

  utils.bodyparts[Game.MOVE]          = 50;
  utils.bodyparts[Game.WORK]          = 20;
  utils.bodyparts[Game.CARRY]         = 50;
  utils.bodyparts[Game.ATTACK]        = 100;
  utils.bodyparts[Game.RANGED_ATTACK] = 150;
  utils.bodyparts[Game.HEAL]          = 200;
  utils.bodyparts[Game.TOUGH]         = 5;

  return utils;
})();
