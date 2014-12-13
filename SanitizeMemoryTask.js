module.exports = (function () {
  'use strict';

  var Task = require('Task');
  var K = require('K');
  var Storage = require('StorageElement');
  var RoomAnalyzer = require('RoomAnalyzer');

  function SanitizeMemoryTask() {
    SanitizeMemoryTask.__super__.constructor.call(this, 'memorySanitizer', 0);
  }

  SanitizeMemoryTask.__super__ = Task.prototype;
  SanitizeMemoryTask.prototype = Object.create(SanitizeMemoryTask.__super__);
  SanitizeMemoryTask.prototype.constructor = SanitizeMemoryTask;

  SanitizeMemoryTask.prototype.doTask = function doTask() {
    var
      builderStorage = Storage.get('assignations.builder'),
      harvesterStorage = Storage.get('assignations.worker'),
      transporterStorage = Storage.get('assignations.transporter');

    [builderStorage, harvesterStorage, transporterStorage].forEach(function (storage) {
      storage.keys().forEach(function (objId) {
        if (!Game.getObjectById(objId)) storage.destroy(objId);
      })
    });

    K.rooms.forEach(function (room) {
      room.find(Game.CONSTRUCTION_SITES).forEach(function (constructionSite) {
        if (!builderStorage.get(constructionSite.id)) {
          builderStorage.set(constructionSite.id, []);
        }
      });

      room.find(Game.SOURCES).forEach(function (source) {
        if (!harvesterStorage.get(source.id)) {
          harvesterStorage.set(source.id, []);
        }
      });

      K.workers.forEach(function (worker) {
        if (!transporterStorage.get(worker.id)) {
          transporterStorage.set(worker.id, []);
        }
      });
    });

  };

  return SanitizeMemoryTask;

})();