var K;
(function () {
  'use strict';

  require('initializers')();
  K = require('K');
  var collections = require('collections');
  var Actions = require('Actions');
  var CreepFactory = require('CreepFactory');

  function getFilterByType(type) {
    return function (value) {
      return value && value.memory.type === type;
    };
  }

  K.workers  = K.creeps.filter(getFilterByType(CreepFactory.WORKER.type));
  K.builders = K.creeps.filter(getFilterByType(CreepFactory.BUILDER.type));

  K.workers.setAction(Actions.harvest);
  K.builders.setAction(Actions.build);

  K.workers.work();
  K.builders.work();

  CreepFactory.tryToFillAll();

}).call(this);