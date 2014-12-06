(function () {
  'use strict';

  require('initializers')();
  var K = require('K');
  var collections = require('collections');
  var Actions = require('Actions');
  var CreepFactory = require('CreepFactory');

  var TaskManager = require('TaskManager');
  var BuildRoadTask = require('BuildRoadTask');
  var SpawnCreepTask = require('SpawnCreepTask');

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

  var tasks = new TaskManager();
  tasks.add(new BuildRoadTask());
  tasks.add(new SpawnCreepTask());

  tasks.runTasks();

  //CreepFactory.tryToFillAll();

}).call(this);