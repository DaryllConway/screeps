var utils = require('utils');

var defaultMemory = {
  'CreepBlueprint' = {
    'Worker' : { 'maxCount': 5 },
    'Builder': { 'maxCount': 3 },
    'Scout'  : { 'maxCount': 0 }
  },
  'creeps': {}
  'debugMode': false
};
defaultMemory['spawns'] = utils.valuesOf(Game.spawns).map(function (spawn) {
  return spawn.name;
});

module.exports = defaultMemory;