(function () {
  'use strict';

  if (!('isRunning' in Memory)) {
    // setup default memory if is empty
    console.log('setup default memory');
    var defaultMemory = require('memory');
    Object.keys(defaultMemory).forEach(function (key) {
      Memory[key] = defaultMemory[key];
    });
  }

  if (Memory.isRunning === false) {
    return;
  }

  try {

    var K = require('K');

    var TaskManager = require('TaskManager');
    var SanitizeMemoryTask = require('SanitizeMemoryTask');
    var SetupGlobalObjectTask = require('SetupGlobalObjectTask');
    var BuildRoadTask = require('BuildRoadTask');
    var SpawnCreepTask = require('SpawnCreepTask');

    var tasks = new TaskManager();
    tasks.add(new SetupGlobalObjectTask());
    tasks.add(new SanitizeMemoryTask());
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