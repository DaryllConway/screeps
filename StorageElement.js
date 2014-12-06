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
      if (!value[keys[index]]) {
        value[keys[index]] = {};
      }
      parentvalue = value;
      value = value[keys[index]];
    }
    parentvalue[keys[index - 1]] = newvalue;
    return utils.isLitteralObject(value) ? new (this.constructor)(keys[index - 1], value) : parentvalue[keys[index - 1]];
  };

  StorageElement.prototype.contains = function containsKey(key) {
    var keys = key.split('.'), value = this.object;
    var index = -1;
    while (++index < keys.length) {
      if (!value[keys[index]]) {
        return false;
      } else {
        value = value[keys[index]];
      }
    }
    return !!value || value === false || value === 0;
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