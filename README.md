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

1. Game.getRoom deprecated, use Game.rooms
2. cpuLimit & getUsedCpu support
3. Method move into behavior: Creep.moveTo() method now reuses the path found along multiple game ticks without recalculation in order to save CPU time. See option reusePath for more info
4. Creep.say() to specify current action/target/coworker
Construction priority
5. Keep in memory instance states if possible
6. rewrite actions.js
7. Comment more existing code
8. Memory.rooms[room.name] is Room.memory, something to do with RoomAnalyzer and maxCount of creeps per room, debugMode

10. find usage of Room.mode (Game.MODE_SIMULATION|Game.MODE_SURVIVAL|Game.MODE_WORLD)
11. create creep Formation with rotate method
12. guard behavior (lookForAt, lookForAtArea could be good to watch what is going on in creep area)
30. road referencing (indexing road position between spawns and sources if spawn already exists)


