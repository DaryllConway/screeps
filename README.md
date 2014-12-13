# Overview

This librairy is under construction and add many concepts to help to maintain code as Collection, Storage, Tasks, ...

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

## TODO

- road referencing
- move method (Creep wrapper ?)
