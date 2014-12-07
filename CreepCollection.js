module.exports = (function () {
  var Collection = require('Collection');
  var utils = require('utils');

  function CreepCollection(creeps) {
    CreepCollection.__super__.constructor.call(this, creeps);
  }

  CreepCollection.__super__ = Collection.prototype;
  CreepCollection.prototype = Object.create(CreepCollection.__super__);
  CreepCollection.prototype.constructor = CreepCollection;

  CreepCollection.prototype.genocide = function () {
    this.forEach(function (creep) { creep.suicide(); });
    this.clear();
  };

  CreepCollection.prototype.work = function () {
    return this.forEach(function (creep) {
      if (typeof creep.behavior === 'function') creep.behavior();
    });
  };

  CreepCollection.prototype.squadIt = function (squadSize) {
    var
      out = new Collection(),
      currentSquadIndex = 0;
    this.forEach(function (creep, index) {
      if (!out.at(currentSquadIndex)) {
        out.add(new CreepCollection());
      }
      out.at(currentSquadIndex).add(creep);
      if (out.at(currentSquadIndex).size() === squadSize) {
        currentSquadIndex += 1;
      }
    });
    return out;
  };

  CreepCollection.prototype.assignAll = function (object) {
    var keys = Object.keys(object), key, value, type;
    this.forEach(function (creep) {
      for (var index in keys) {
        key = keys[index];
        value = object[key];
        if (utils.isLitteralObject(value)) {
          creep[key] = utils.clone(value);
        } else {
          creep[key] = value;
        }
      }
    });
  };

  CreepCollection.prototype.assignAllInMemory = function (object) {
    var keys = Object.keys(object), key, value, type;
    this.forEach(function (creep) {
      for (var index in keys) {
        key = keys[index];
        value = object[key];
        if (utils.isLitteralObject(value)) {
          creep.memory[key] = utils.clone(value);
        } else {
          creep.memory[key] = value;
        }
      }
    });
  };

  return CreepCollection;
})();
