function Collection(entities) {
  this.children = [];
  this.actionName = null;
  if (entities instanceof Array) this.addAll(entities);
}

Collection.prototype.constructor = Collection;

Collection.prototype.addAll = function (entities) {
  for (var index in entities) {
    this.add(entities[index]);
  }
  return this;
};

Collection.prototype.add = function (entity) {
  if (this.indexOf(entity) === -1) {
    return this.children.push(entity);
  }
  return -1;
};

Collection.prototype.removeAt = function (index) {
  return this.children.splice(index, 1)[0];
};

Collection.prototype.remove = function (entity) {
  return this.removeAt(this.indexOf(entity));
};

Collection.prototype.removeAll = function (entities) {
  var index = -1, len = entities.length, out = new (this.constructor)();
  while (++index < len) {
    out.add(this.remove(entities[index]));
  }
  return out;
};

Collection.prototype.indexOf = function (entity) {
  return this.children.indexOf(entity);
};

Collection.prototype.forEach = function (callback, context) {
  var index = -1, len = this.children.length;
  while (++index < len) {
    callback.call(context || this.children[index], this.children[index], index, this);
  }
  return this;
};

Collection.prototype.map = function (callback, context) {
  var index = -1, len = this.children.length, out = new (this.constructor)();
  while (++index < len) {
    out.add(callback.call(context || this.children[index], this.children[index], index, this));
  }
  return out;
};

Collection.prototype.filter = function (callback, context) {
  var index = -1, len = this.children.length, out = new (this.constructor)();
  while (++index < len) {
    if (callback.call(context || this.children[index], this.children[index], index, this)) {
      out.add(this.children[index]);
    }
  }
  return out;
};

module.exports = Collection;