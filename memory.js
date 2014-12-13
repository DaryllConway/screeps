var utils = require('utils');

var defaultMemory = {
  'assignations': {
    'worker':  {},
    'builder': {},
    'scout':   {}
  },
  'blueprints': {
    'worker' : {
      'maxCount': 4,
      'bodyparts': ['move', 'move', 'carry', 'carry', 'work']
    },
    'builder': {
      'maxCount': 3,
      'bodyparts': ['move', 'carry', 'carry', 'work', 'work']
    },
    'scout'  : {
      'maxCount': 0,
      'bodyparts': ['move', 'move']
    }
  },
  'creeps': {},
  'spawns': [],
  'debugMode': false,
  'isRunning': false
};
defaultMemory['spawns'] = utils.valuesOf(Game.spawns).map(function (spawn) {
  return spawn.name;
});

module.exports = defaultMemory;