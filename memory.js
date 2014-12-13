var utils = require('utils');

var defaultMemory = {
  'assignations': {
    'worker':  {},
    'builder': {},
    'scout':   {}
  },
  'blueprints': {
    'worker' : {
      'maxCount': 2, // per room per energySources * spawns
      'bodyparts': ['move', 'move', 'carry', 'carry', 'work']
    },
    'builder': {
      'maxCount': 3, // per room
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