(function () {
  'use strict';

  require('intializers');
  var Actions = require('Actions');
  var CreepTypes = require('CreepTypes');

  function getFilterByType(type) {
    return function (value) {
      return value && value.type === type;
    };
  }

  var workers = Game.collections.creep.filter(getFilterByType(CreepTypes.WORKER.type));
  var builers = Game.collections.creep.filter(getFilterByType(CreepTypes.BUILDER.type));

  workers.setAction(Actions.harvest);
  builders.setAction(Actions.build);

  workers.work()
  builders.work();

  CreepTypes.tryToFillAll();

}).call(this);