(function () {
  var Storage = require('StorageElement');
  var utils = require('utils');

  var memoryFields = ['type', 'nextDirection'];
  // var creepFields  = ['id', 'name', 'owner', 'room', 'pos', 'memory', 'my', 'spawning', 'body', 'energy', 'energyCapacity', 'hits', 'hitsMax', 'ticksToLive', 'fatigue'];

  /**
   * This method defines properties into context (CreepWrapper instance)
   * I used here the Function constructor for two reasons:
   *   - each Function instance will be already interpreted by the js vm
   *   - i dont want scoped variable into getter and setter (fieldName)
   * This is good or bad, i dont really know, this is just a test
   * @param {CreepWrapper} context
  **/
  function defineMemoryFields(context) {
    var index = -1, len = memoryFields.length, fieldName;
    while (++index < len) {
      fieldName = memoryFields[index];
      Object.defineProperty(context, fieldName, {
        get: new Function('return this.creep.memory.' + fieldName + ';'),
        set: new Function('type', 'return this.creep.memory.' + fieldName + ' = type;'),
        configurable: false,
        writable: true,
        enumerable:  true
      });
    }
  }

  function defineCreepHelper(context) {
    var index = -1, len = creepFields.length, fieldName;
    while (++index < len) {
      fieldName = creepFields[index];
      Object.defineProperty(context, fieldName, {
        get: new Function('return this.creep.' + fieldName + ';'),
        set: new Function('value', 'return this.creep.' + fieldName + ' = value;'),
        configurable: false,
        writable: true,
        enumerable:  true
      });
    }
  }

  /**
   * Defines specific memory fields
   * @param {CreepWrapper} context
  **/
  function defineSpecificsMemoryFields(context) {
    Object.defineProperty(context, 'target', {
      get: function getTarget() {
        this.creep.memory.target ? Game.getObjectById(this.creep.memory.target) : null;
      },
      set: function setTarget(target) {
        var targetId;
        if (target) {
          targetId = typeof target === 'string' ? target : target.id;
          Storage.get('assignations.' + this.type + '.' + targetId).push(creep.name);
          this.creep.memory.target = targetId;
          this.nextDirection = null;
        }
      },
      configurable: false,
      writable: true,
      enumerable:  true
    });

    var storage = new Storage(this.creep.memory);
    Object.defineProperty(context, 'storage', {
      get: function () { return storage; },
      configurable: false,
      writable: false,
      enumerable:  true
    });
  }

  /**
   * This is wrapper around a creep to implement my methods
   * and help to maintain code
   * @constructor
   * @param {!Creep} creep
  **/
  function CreepWrapper(creep) {
    this.creep = creep;
    defineMemoryFields(this);
    defineSpecificsMemoryFields(this);
    defineCreepHelper(this);
  }

  CreepWrapper.prototype.constructor = CreepWrapper;

  CreepWrapper.prototype.move = function move(targetedPosition, options) {
    if (targetedPosition.pos) { targetedPosition = targetedPosition.pos; }
    if (this.pos.inRangeTo(targetedPosition, 1)) {
      // the creep is near to the targetedPosition

    }
  };

  CreepWrapper.prototype.behavior = function () {};

})();