# Overview

This library is under construction and add many concepts to help maintain and improve the code readability as Collection, Storage, Tasks, ... You can clone my code, i don't care. This is just to make an experience the IA structure and whether it is appropriate to use OOP with the prototype structure instead of OOP with only functions with a procedural structure.

At present development of screeps, I feel that all code is eval() at each tick, and instances are not stored in memory between each tick. The only advantage of using prototypes is that structure your code and improves this readability.

## Collection

This is an object that embed many methods to help manipulating entities.

## Task

A Task is a code that will be run on every n tick.

```javascript
var Task = require('Task');

function MyTask() {
  MyTask.__super__.constructor.call(this, 'set a unique id here', 4);
  // this task will be run every 4 ticks
}

// prototype inheritance
MyTask.__super__ = Task.prototype;
MyTask.prototype = Object.create(MyTask.__super__);
MyTask.constructor = MyTask;

MyTask.prototype.doTask = function () {
  // do what you want here
};
```

## RoomAnalyzer

This object analyzes a room. You can analyze spawns, creeps, structures, extensions, construction sites or sources separatly or not;

if you call the analyze method many times in your code, the room related to the RoomAnalyzer instance will not be calculated again. The result of the room analysis is keep in cache, so you can call the method analyze several times with one of these type, and no more cpu times will be taken to this operation.
The structure of result of the analysis is in dataDefaultRoomAnalyzerResult.js

You can pass several types with the byte operator '|'

```javascript
var analyzer = RoomAnalyzer.getRoom(creep.room);
var result = analyzer.analyze(RoomAnalyzer.TYPE_STRUCTURES | RoomAnalyzer.TYPE_CONSTRUCTION_SITES | RoomAnalyzer.TYPE_CREEPS);
```


## TODO

<ol>
  <li>Make it work. Log a reminder in Game.MODE_SIMULATION to create Spawn1 and some sources.</li>
  <li>Game.getRoom() deprecated, use Game.rooms</li>
  <li>Method move into behavior: Creep.moveTo() method now reuses the path found along multiple game ticks without recalculation in order to save CPU time. See option reusePath for more info</li>
  <li>Creep.say() to specify current action/target/coworker. see inverseState, cancelTransport</li>
  <li>Create a changeNextTransporterId, changeNextBlahBlah</li>
  <li>Keep in memory instance states if possible</li>
  <li>rewrite actions.js, maybe one method by file</li>
  <li>Comment more existing code</li>
  <li>Memory.rooms[room.name] is Room.memory, something to do with RoomAnalyzer and maxCount of creeps per room, debugMode</li>
  <li>Create a method or object, that say easily if the support units are stucked or not. Do something to avoid that in an ideal way.</li>
  <li>find usage of Room.mode (Game.MODE_SIMULATION|Game.MODE_SURVIVAL|Game.MODE_WORLD)</li>
  <li>create creep Formation with rotate method</li>
  <li>guard behavior (lookForAt, lookForAtArea could be good to watch what is going on in creep area)</li>
  <li>cpuLimit & getUsedCpu support</li>
  <li>Construction priority</li>
  <li>road referencing (indexing road position between spawns and sources if spawn already exists)</li>
</ol>

## Ideas

- Make something to extend instance with mixins
- Something to do with RangeAnalyzer and lookForAt, lookForAtArea methods
