(function () {
  'use strict';

  var
    defaultMemory, K, TaskManager, SanitizeMemoryTask, SetupGlobalObjectTask,
    BuildRoadTask, SpawnCreepTask, RoomAnalyzer, tasks;

  if (!('isRunning' in Memory)) {
    // setup default memory if is empty
    console.log('setup default memory');
    defaultMemory = require('memory');
    Object.keys(defaultMemory).forEach(function (key) {
      Memory[key] = defaultMemory[key];
    });
    Memory.isRunning = !!Object.keys(Game.spawns || {}).length;
  }

  if (Memory.isRunning === false) return;

  try {

    K = require('K');

    TaskManager = require('TaskManager');
    SanitizeMemoryTask = require('SanitizeMemoryTask');
    SetupGlobalObjectTask = require('SetupGlobalObjectTask');
    // BuildRoadTask = require('BuildRoadTask');
    SpawnCreepTask = require('SpawnCreepTask');
    RoomAnalyzer = require('RoomAnalyzer');

    tasks = new TaskManager();
    tasks.add(new SetupGlobalObjectTask());
    tasks.add(new SanitizeMemoryTask());
    // tasks.add(new BuildRoadTask());
    tasks.add(new SpawnCreepTask());

    tasks.runTasks();

    K.workers.work();
    K.builders.work();
    K.transporters.work();

    RoomAnalyzer.disposeAll();

  } catch (err) {
    if (Memory.debugMode === true) {
      Memory.isRunning = false;
    }
    throw err;
  }

}).call(this);