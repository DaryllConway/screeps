module.exports = (function () {
  'use strict';

  var utils = require('utils');
  var root;

  function StorageElement(key, object) {
    this.object = object;
    this.key = key;
  }

  StorageElement.prototype.constructor = StorageElement;

  StorageElement.prototype.get = function(key) {
    var keys = key.split('.');
    var value = this.object;
    var index = -1;
    while (++index < keys.length) {
      if (!value[keys[index]]) {
        return null;
      } else {
        value = value[keys[index]];
      }
    }
    return utils.isLitteralObject(value) ? new (this.constructor)(keys[index - 1], value) : value;
  };

  StorageElement.prototype.set = function set(key, newvalue) {
    var keys = key.split('.');
    var value = this.object, parentvalue;
    var index = -1;
    while (++index < keys.length) {
      if (!value[keys[index]] && value[keys[index]] !== 0 && value[keys[index]] !== false) {
        value[keys[index]] = {};
      }
      parentvalue = value;
      value = value[keys[index]];
    }
    parentvalue[keys[index - 1]] = newvalue;
    return utils.isLitteralObject(value) ? new (this.constructor)(keys[index - 1], value) : parentvalue[keys[index - 1]];
  };

  StorageElement.prototype.destroy = function destroy(key) {
    var keys = key.split('.');
    var value = this.object, parentvalue;
    var index = -1;
    while (++index < keys.length) {
      if (!value[keys[index]] && value[keys[index]] !== 0 && value[keys[index]] !== false) {
        value[keys[index]] = {};
      }
      parentvalue = value;
      value = value[keys[index]];
    }
    delete parentvalue[keys[index - 1]];
  };

  StorageElement.prototype.values = function values() {
    var memoryObject = this.object;
    return this.keys().map(function (key) { return memoryObject[key]; });
  };

  StorageElement.prototype.keys = function keys() {
    return Object.keys(this.object);
  };

  StorageElement.prototype.contains = function containsKey(key) {
    var keys = key.split('.'), value = this.object;
    var index = -1;
    while (++index < keys.length) {
      if (!value[keys[index]] && value[keys[index]] !== 0 && value[keys[index]] !== false) {
        return false;
      } else {
        value = value[keys[index]];
      }
    }
    return !!value || value === false || value === 0;
  };

  StorageElement.prototype.incr = function incr(key, step) {
    var keys = key.split('.');
    var value = this.object, parentvalue;
    var index = -1, lastDefaultValueIndex;
    while (++index < keys.length) {
      if (!value[keys[index]] && value[keys[index]] !== 0 && value[keys[index]] !== false) {
        value[keys[index]] = {};
        lastDefaultValueIndex = index;
      }
      parentvalue = value;
      value = value[keys[index]];
    }
    if (lastDefaultValueIndex === index - 1) parentvalue[keys[index - 1]] = 0;
    parentvalue[keys[index - 1]] += step || 1;
    return parentvalue[keys[index - 1]];
  };

  StorageElement.prototype.findInArray = function findInArray(key, item) {
    var keys = key.split('.');
    var value = this.object, parentvalue;
    var index = -1, lastDefaultValueIndex;
    while (++index < keys.length) {
      if (!value[keys[index]] && value[keys[index]] !== 0 && value[keys[index]] !== false) {
        value[keys[index]] = {};
      }
      parentvalue = value;
      value = value[keys[index]];
    }
    if (value instanceof Array) {
      return value.indexOf(item);
    }
    return -1;
  };

  StorageElement.prototype.decr = function decr(key, step) {
    return this.incr(key, -(step || 1));
  };

  StorageElement.prototype.getRoot = function getRoot() {
    return root;
  };

  StorageElement.prototype.isRoot = function isRoot() {
    return this.object === Memory;
  };

  StorageElement.prototype.toString = function toString() {
    return 'StorageElement[' + this.key + ']';
  };

  root = new StorageElement('Memory', Memory);

  return root;

})();