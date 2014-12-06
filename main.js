(function () {
  'use strict';

  if (Memory.isRunning === false) {
    return;
  }

  try {

    var K = require('K');

    var TaskManager = require('TaskManager');
    var SetupGlobalObjectTask = require('SetupGlobalObjectTask');
    var BuildRoadTask = require('BuildRoadTask');
    var SpawnCreepTask = require('SpawnCreepTask');

    var tasks = new TaskManager();
    tasks.add(new SetupGlobalObjectTask());
    tasks.add(new BuildRoadTask());
    tasks.add(new SpawnCreepTask());

    tasks.runTasks();

    K.workers.work();
    K.builders.work();

  } catch (err) {
    if (Memory.debugMode === true) {
      Memory.isRunning = false;
    }
    throw err;
  }

}).call(this);