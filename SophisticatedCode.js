/*
* File Name: SophisticatedCode.js
* Description: This code demonstrates a sophisticated implementation of a task scheduler with multiple priority levels in JavaScript.
*/

class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.priorityLevels = 5;
    this.currentTask = null;
    this.active = false;
  }
  
  addTask(task, priority) {
    this.tasks[priority].push(task);
  }
  
  start() {
    if (this.active) {
      console.log("Task Scheduler is already active.");
      return;
    }
    
    this.active = true;
    this.scheduleNextTask();
  }
  
  stop() {
    if (!this.active) {
      console.log("Task Scheduler is already stopped.");
      return;
    }
    
    this.active = false;
  }
  
  scheduleNextTask() {
    if (!this.active) {
      return;
    }
    
    for (let priority = 0; priority < this.priorityLevels; priority++) {
      const tasks = this.tasks[priority];
      if (tasks.length > 0) {
        const task = tasks.shift();
        this.currentTask = task;
        console.log(`Running task: ${task}`);
        
        // Simulating task execution
        setTimeout(() => {
          console.log(`Task completed: ${task}`);
          this.currentTask = null;
          this.scheduleNextTask();
        }, Math.random() * 1000 + 500);
        
        break;
      }
    }
    
    if (!this.currentTask) {
      console.log("All tasks completed.");
      this.active = false;
    }
  }
}

// Usage Example:

const taskScheduler = new TaskScheduler();

// Adding tasks with different priorities
taskScheduler.addTask("Low Priority Task 1", 0);
taskScheduler.addTask("High Priority Task 1", 4);
taskScheduler.addTask("Medium Priority Task 1", 2);
taskScheduler.addTask("Medium Priority Task 2", 2);
taskScheduler.addTask("Low Priority Task 2", 0);
taskScheduler.addTask("High Priority Task 2", 4);

// Starting the task scheduler
taskScheduler.start();

// Stopping the task scheduler
// taskScheduler.stop();
