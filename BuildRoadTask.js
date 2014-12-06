module.exports = (function () {
  'use strict';

  var Task = require('Task');

  function BuildRoadTask() {
    BuildRoadTask.__super__.constructor.call(this, 'buildRoad', 30000);
  }

  BuildRoadTask.__super__ = Task.prototype;
  BuildRoadTask.prototype = Object.create(BuildRoadTask.__super__);
  BuildRoadTask.prototype.constructor = BuildRoadTask;

  BuildRoadTask.prototype.doTask = function doTask() {

  };

  return BuildRoadTask;

})();