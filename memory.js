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
      'bodyparts': 'move carry work work work carry carry work carry carry work carry carry work carry carry work carry carry'.split(' ')
    },
    'transporter': {
      'maxCount': 2, // per room per worker
      'bodyparts': 'move move move carry carry move carry move carry move carry move carry move carry move carry move carry'.split(' ')
    },
    'builder': {
      'maxCount': 4, // per room
      'bodyparts': 'move carry work work carry move move carry carry work work carry carry work work carry carry work work'.split(' ')
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