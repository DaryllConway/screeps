# Overview

This library is under construction and add many concepts to help to maintain and improve the readability of the code as Collection, Storage, Tasks, ...

## Collection

This is an object that embed many methods to help manipulating entities.

## Task

A Task is a code that will be run on every n tick.

```javascript
var Task = require('Task');

function MyTask() {
  MyTask.__super__.constructor.call(this, 'set a unique id here', 4)
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

if you call the analyze method many times in your code, the room related to the RoomAnalyzer instance will not be calculated again.
The structure of result of the analysis is in dataDefaultRoomAnalyzerResult.js

You can pass several types with the byte operator '|'

```javascript
var analyzer = RoomAnalyzer.getRoom(creep.room)
var result = analyzer.analyze(RoomAnalyzer.TYPE_STRUCTURES | RoomAnalyzer.TYPE_CONSTRUCTION_SITES | RoomAnalyzer.TYPE_CREEPS);
```

The result of the room analysis is keep in cache, so you can call the method analyze several times with one of these type, and no more cpu times will be taken to this operation.

## TODO

- create Formation with rotate method
- guard behavior
- road referencing


