var Collection = require('Collection.js');
var CallbackHandler = require('CallbackHandler.js');
var utils = require('utils');

function CreepCollection(creeps) {
  if (creeps instanceof Array) this.addAll(creeps);
}

CreepCollection.__super__ = Collection.prototype;
CreepCollection.prototype = Object.create(CreepCollection.__super__);
CreepCollection.prototype.constructor = CreepCollection;

Collection.prototype.setAction = function (callback, context) {
  if (typeof callback !== 'function') {
    throw new Error('Collection::setAction Argument is not a function');
  }
  this.action = { 'callback': callback, 'context': context };
};

Collection.prototype.work = function () {
  return this.forEach(this.action.callback, this.action.context);
};

Collection.prototype.assignAll = function (object) {
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

Collection.prototype.assignAllInMemory = function (object) {
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