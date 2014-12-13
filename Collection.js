module.exports = (function () {
  'use strict';

  function Collection(entities) {
    this.children = entities instanceof Array ? entities : [];
    this.actionName = null;
    if (entities instanceof Collection) this.addAll(entities);
  }

  Collection.prototype.constructor = Collection;

  Collection.prototype.addAll = function addAll(entities) {
    entities = entities instanceof Collection ? entities.children : entities;
    for (var index in entities) {
      if (typeof entities[index] !== 'function' && typeof entities[index] !== 'undefined' && entities[index] !== null) this.add(entities[index]);
    }
    return this;
  };

  Collection.prototype.add = function add(entity) {
    if (this.indexOf(entity) === -1) {
      return this.children.push(entity);
    }
    return -1;
  };

  Collection.prototype.removeAt = function removeAt(index) {
    return this.children.splice(index, 1)[0];
  };

  Collection.prototype.remove = function remove(entity) {
    return this.removeAt(this.indexOf(entity));
  };

  Collection.prototype.clear = function clear() {
    while (this.children.pop()) {}
  };

  Collection.prototype.removeAll = function removeAll(entities) {
    entities = entities instanceof Collection ? entities.children : entities;
    var index = -1, len = entities.length, out = new (this.constructor)();
    while (++index < len) {
      out.add(this.remove(entities[index]));
    }
    return out;
  };

  Collection.prototype.indexOf = function indexOf(entity) {
    return this.children.indexOf(entity);
  };

  Collection.prototype.forEach = function forEach(callback, context) {
    var index = -1, len = this.children.length;
    while (++index < len) {
      callback.call(context || this.children[index], this.children[index], index, this);
    }
    return this;
  };

  Collection.prototype.map = function map(callback, context) {
    var index = -1, len = this.children.length, out = new (this.constructor)();
    while (++index < len) {
      out.add(callback.call(context || this.children[index], this.children[index], index, this));
    }
    return out;
  };

  Collection.prototype.filter = function filter(callback, context) {
    var index = -1, len = this.children.length, out = new (this.constructor)();
    while (++index < len) {
      if (callback.call(context || this.children[index], this.children[index], index, this)) {
        out.add(this.children[index]);
      }
    }
    return out;
  };

  Collection.prototype.find = function find(callback, context) {
    var index = -1, len = this.children.length;
    while (++index < len) {
      if (callback.call(context || this.children[index], this.children[index], index, this)) {
        return this.children[index];
      }
    }
  };

  Collection.prototype.size = function size() {
    return this.children.length;
  };

  Collection.prototype.first = function first() {
    return this.children[0] || null;
  };

  Collection.prototype.last = function last() {
    return this.children[this.children.length - 1] || null;
  };

  Collection.prototype.findNearest = function findNearest(x, y) {
    var
      nearestIndex = -1, nearestCount = Number.MAX_VALUE,
      index = -1, path;
    if (this.children.length < 2) {
      return this.children[0] || null;
    }
    if (!y) {
      y = x.y;
      x = x.x;
    }
    while (++index < this.children.length) {
      if (this.children[index] && (path = this.children[index].pos.findPathTo(x, y)).length < nearestCount) {
        nearestCount = path.length;
        nearestIndex = index;
      }
    }
    return this.children[nearestIndex] || null;
  };

  Collection.prototype.toString = function toString() {
    return this.constructor.name + '[size: ' + this.children.length + ']';
  };

  Collection.prototype.sort = function sort(comparator) {
    return new (this.constructor)(this.children.sort(comparator));
  };

  Collection.prototype.asc = function asc(key) {
    return this.sort(function (a, b) { if (a[key] > b[key]) { return 1; } else if (a[key] < b[key]) { return -1; } return 0; });
  };
  Collection.prototype.desc = function desc(key) {
    return this.sort(function (a, b) { if (a[key] < b[key]) { return 1; } else if (a[key] > b[key]) { return -1; } return 0; });
  };

  Collection.prototype.at = function at(index) {
    return this.children[index];
  };

  Collection.prototype.merge = function merge(other) {
    return new this.constructor(this.children.slice(0).concat(other instanceof Collection ? other.children : other));
  };

  Collection.prototype.clone = function clone() {
    return new this.constructor(this.children.slice(0));
  };

  return Collection;
})();
