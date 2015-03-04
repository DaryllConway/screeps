module.exports = (function () {
  var Look = {};

  Look.isBuildable = function isBuildable(look) {
    for (var index = 0; index < look.length; index++) {
      if (/source|exit/.test(look[index].type) || /wall/.test(look[index].terrain) || !(look[index].type === 'structure' && look[index].structureType === Game.STRUCTURE_RAMPART)) {
        return false;
      }
    }
    return true;
  };

  Look.containsStructureType = function containsStructureType(look, structureType) {
    for (var index = 0; index < look.length; index++) {
      if (look[index].type === 'structure' && look[index].structure.structureType === structureType) {
        return true;
      }
    }
    return false;
  };

  return Look;
})();