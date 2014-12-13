var utils = require('utils');

var defaultMemory = {
  'assignations': {
    'worker': {},
    'builder': {},
    'transporter': {},
    'scout': {}
  },
  'blueprints': {
    'worker' : {
      'maxCount': 2, // per room per energySources
      'bodyparts': ['move', 'carry', 'work', 'work', 'work']
    },
    'builder': {
      'maxCount': 5, // per room
      'bodyparts': ['move', 'move', 'carry', 'work', 'work']
    },
    'transporter': {
      'maxCount': 2, // per room per worker
      'bodyparts': ['move', 'move', 'move', 'carry', 'carry']
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