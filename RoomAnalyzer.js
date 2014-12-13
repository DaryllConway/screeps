module.exports = (function () {
  'use strict';

  function RoomAnalyzer(roomName, options) {
    this.roomName = roomName;
    this.room = Game.getRoom(roomName);
    this.analyzis = 0;
    this.result = this.createDefaultResult();
    this.options = options || this.getDefaultOptions();
  }

  var lastByte = 1;
  "spawns creeps structures extensions construction_sites sources".split(' ').forEach(function (value) {
    lastByte = RoomAnalyzer['TYPE_' + value.toUpperCase()] = lastByte * 2;
  });

  RoomAnalyzer.prototype.constructor = RoomAnalyzer;

  RoomAnalyzer.prototype.getDefaultOptions = function getDefaultOptions() {
    return {
      nearEnergyRatio: 0.1,
      nearDeathRatio: 0.25,
      nearConstructionProgressRatio: 0.3,
      strategic: false,
      noroad: false,
      norampart: false,
      nowall: false,
      nospawn: false,
      noextension: false
    };
  };

  RoomAnalyzer.prototype.canRunAnalyzeOn = function canRunAnalyzeOn(type, analyzeType) {
    return !!(this.analyzis ^ analyzeType) && (type === 0 || !!(type & analyzeType));
  };

  RoomAnalyzer.prototype.analyze = function analyze(type, options) {
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_SPAWNS)) {
      this.analyzeSpawns(options);
    }
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_EXTENSIONS)) {
      this.analyzeExtensions(options);
    }
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_CREEPS)) {
      this.analyzeCreeps(options);
    }
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_STRUCTURES)) {
      this.analyzeStructures(options);
    }
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_CONSTRUCTION_SITES)) {
      this.analyzeConstructionSites(options);
    }
    if (this.canRunAnalyzeOn(type, RoomAnalyzer.TYPE_SOURCES)) {
      this.analyzeSources(options);
    }
    return this.result;
  };

  RoomAnalyzer.prototype.invalidateAnalyze = function invalidateAnalyze(type) {
    type === 0 ? this.analyzis = 0 : this.analyzis ^= type;
  };

  RoomAnalyzer.prototype.analyzeCreeps = function analyzeCreeps(options) {
    var self = this;
    options = options || this.options;
    this.room.find(Game.CREEPS).forEach(function (creep) {
      self.analyzeCreepInformationAbout(creep, options);
      if (options.strategic) {
        self.buildStrategicInformationAbout(creep, options);
      }
    });
    this.analyzis |= RoomAnalyzer.TYPE_CREEPS;
  };

  RoomAnalyzer.prototype.analyzeStructures = function analyzeStructures(options) {
    var self = this;
    this.room.find(Game.STRUCTURES).forEach(function (structure) {
      self.analyzeStructureInformationAbout(structure, options);
    });
    this.analyzis |= RoomAnalyzer.TYPE_STRUCTURES;
  };

  RoomAnalyzer.prototype.analyzeExtensions = function analyzeExtensions(options) {
    var self = this;
    this.room.find(Game.MY_STRUCTURES).forEach(function (structure) {
      if (structure.structureType === Game.STRUCTURE_EXTENSION) self.analyzeEnergyInformationAbout(structure, options);
    });
    this.analyzis |= RoomAnalyzer.TYPE_EXTENSIONS;
  };

  RoomAnalyzer.prototype.analyzeSpawns = function analyzeSpawns(options) {
    var result = this.result;
    var self = this;
    this.room.find(Game.MY_SPAWNS).forEach(function (spawn) {
      self.analyzeEnergyInformationAbout(spawn, options);
      self.analyzeSpawnInformationAbout(spawn, options);
    });
    this.analyzis |= RoomAnalyzer.TYPE_SPAWNS;
  };

  RoomAnalyzer.prototype.analyzeConstructionSites = function analyzeConstructionSites(options) {
    var result = this.result;
    var self = this;
    this.room.find(Game.CONSTRUCTION_SITES).forEach(function (site) {
      self.analyzeConstructionSitesInformationAbout(site, options);
    });
    this.analyzis |= RoomAnalyzer.TYPE_CONSTRUCTION_SITES;
  };

  RoomAnalyzer.prototype.analyzeSources = function analyzeSources(options) {
    var result = this.result;
    var self = this;
    this.room.find(Game.SOURCES).forEach(function (source) {
      self.analyzeSourcesInformationAbout(source, options);
    });
    this.analyzis |= RoomAnalyzer.TYPE_SOURCES;
  };

  RoomAnalyzer.prototype.analyzeEnergyInformationAbout = function analyzeEnergyInformationAbout(structure, options) {
    var result = this.result.energyStorages;
    options = options || this.options;

    result.totalEnergy += structure.energy;
    result.totalEnergyCapacity += structure.energyCapacity;
    result.count += 1;

    var energyRatio = structure.energy / structure.energyCapacity;
    if (energyRatio === 1) {
      result.filled.add(structure);
    } else if (energyRatio === 0) {
      result.empty.add(structure);
    } else if (energyRatio > 1 - options.nearEnergyRatio) {
      result.nearFull.add(structure);
    } else if (energyRatio < options.nearEnergyRatio) {
      result.nearEmpty.add(structure);
    } else {
      result.others.add(structure);
    }
  };

  RoomAnalyzer.prototype.analyzeCreepInformationAbout = function analyzeCreepInformationAbout(creep, options) {
    var result = creep.my ? this.result.creeps : this.result.hostiles.creeps;
    options = options || this.options;
    result.count += 1;
    if (creep.hits / creep.hitsMax < options.nearDeathRatio) {
      result.nearDeath.add(creep);
    } else if (creep.hits < creep.hitsMax) {
      result.damaged.add(creep);
    } else {
      result.full.add(creep);
    }
  };

  RoomAnalyzer.prototype.analyzeStructureInformationAbout = function analyzeStructureInformationAbout(structure, options) {
    var result = structure.my || structure.structureType === Game.STRUCTURE_ROAD || structure.structureType === Game.STRUCTURE_WALL ? this.result.structures : this.result.hostiles.structures;
    options = options || this.options;
    if (
      options.noroad      && structure.structureType === Game.STRUCTURE_ROAD    ||
      options.norampart   && structure.structureType === Game.STRUCTURE_RAMPART ||
      options.nowall      && structure.structureType === Game.STRUCTURE_WALL    ||
      options.nospawn     && structure.structureType === Game.STRUCTURE_SPAWN   ||
      options.noextension && structure.structureType === Game.STRUCTURE_EXTENSION
    ) return;

    result.count += 1;
    if (structure.hits < structure.hitsMax) {
      result.damaged.add(structure);
    }
  };

  RoomAnalyzer.prototype.analyzeSpawnInformationAbout = function analyzeSpawnInformationAbout(spawn, options) {
    options = options || this.options;
    if (!spawn.spawning) this.result.spawn.free.add(spawn);
    this.result.spawn.count += 1;
  };

  RoomAnalyzer.prototype.analyzeConstructionSitesInformationAbout = function analyzeConstructionSitesInformationAbout(site, options) {
    var result = site.my ? this.result.constructions : this.result.hostiles.constructions;
    options = options || this.options;
    if (
      options.noroad      && site.structureType === Game.STRUCTURE_ROAD    ||
      options.norampart   && site.structureType === Game.STRUCTURE_RAMPART ||
      options.nowall      && site.structureType === Game.STRUCTURE_WALL    ||
      options.nospawn     && site.structureType === Game.STRUCTURE_SPAWN   ||
      options.noextension && site.structureType === Game.STRUCTURE_EXTENSION
    ) return;
    var progressRatio = site.progress / 100;
    if (progressRatio === 0) {
      result.empty.add(site);
    } else if (progressRatio > 1 - options.nearConstructionProgressRatio) {
      result.nearFull.add(site);
    } else if (progressRatio < options.nearConstructionProgressRatio) {
      result.nearEmpty.add(site);
    } else {
      result.others.add(site);
    }
  };

  RoomAnalyzer.prototype.analyzeSourcesInformationAbout = function analyzeSourcesInformationAbout(source, options) {
    var result = this.result.energySources;
    options = options || this.options;
    result.energy += source.energy;
    result.totalEnergy += source.energyCapacity;
    result.count += 1;

    var energyRatio = source.energy / source.energyCapacity;
    if (energyRatio === 1) {
      result.filled.add(source);
    } else if (energyRatio === 0) {
      result.empty.add(source);
    } else if (energyRatio > 1 - options.nearEnergyRatio) {
      result.nearFull.add(source);
    } else if (energyRatio < options.nearEnergyRatio) {
      result.nearEmpty.add(source);
    } else {
      result.others.add(source);
    }
  };

  RoomAnalyzer.prototype.buildStrategicInformationAbout = function buildStrategicInformationAbout(options) {
    // TODO: define what is strategic in a room
  };

  RoomAnalyzer.prototype.createDefaultResult = function createDefaultResult() {
    return require('dataDefaultRoomAnalyzerResult')();
  };

  RoomAnalyzer.prototype.dispose = function dispose() {
    this.analyzis = 0;
    this.room = this.result = null;
    delete RoomAnalyzer.rooms[this.roomName]
  };

  RoomAnalyzer.rooms = {};
  RoomAnalyzer.getRoom = function getRoom(roomName) {
    if (roomName.name) roomName = roomName.name;
    if (!RoomAnalyzer.rooms[roomName]) {
      RoomAnalyzer.rooms[roomName] = new RoomAnalyzer(roomName);
    }
    return RoomAnalyzer.rooms[roomName];
  };

  RoomAnalyzer.disposeAll = function disposeAll() {
    Object.keys(RoomAnalyzer.rooms).forEach(function (key) {
      RoomAnalyzer.rooms[key].dispose();
    });
  };

  return RoomAnalyzer;
})();