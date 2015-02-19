module.exports = (function () {
  'use strict';

  return {
    '-1': { errCode: -1, errMessage: 'ERR_NOT_OWNER' },
    '-2': { errCode: -2, errMessage: 'ERR_NO_PATH' },
    '-3': { errCode: -3, errMessage: 'ERR_NAME_EXISTS' },
    '-4': { errCode: -4, errMessage: 'ERR_BUSY' },
    '-5': { errCode: -5, errMessage: 'ERR_NOT_FOUND' },
    '-6': { errCode: -6, errMessage: 'ERR_NOT_ENOUGH_ENERGY' },
    '-7': { errCode: -7, errMessage: 'ERR_INVALID_TARGET' },
    '-8': { errCode: -8, errMessage: 'ERR_FULL' },
    '-9': { errCode: -9, errMessage: 'ERR_NOT_IN_RANGE' },
    '-10': { errCode: -10, errMessage: 'ERR_INVALID_ARGS' },
    '-11': { errCode: -11, errMessage: 'ERR_TIRED' },
    '-12': { errCode: -12, errMessage: 'ERR_NO_BODYPART' },
    '-13': { errCode: -13, errMessage: 'ERR_NOT_ENOUGH_EXTENSIONS' }
  };

})();