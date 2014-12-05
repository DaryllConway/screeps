module.exports = (function () {
  // I know this is bad, but sometimes a little monkey patch could be helpful =D
  if (!Array.prototype.first) {
    Array.prototype.first = function () { return this[0]; };
    Array.prototype.last = function () { return this[this.length - 1]; };
  }

  Game.collections = {};
  Game.collections.creeps = new CreepCollection();
  // Keep Game.creeps reference
  Game.collections.creeps.children = Game.creeps;

  return {
    initialized: true
  };
})();