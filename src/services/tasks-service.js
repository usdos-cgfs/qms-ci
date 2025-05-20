import * as ko from "knockout";
import { ProgressTask, Task, TaskDef } from "../value-objects/task.js";

export const tasks = {
  init: new TaskDef("Initializing the Application"),
  save: new TaskDef("Saving Plan...", true),
  cancelAction: new TaskDef("Cancelling Action..."),
  view: new TaskDef("Viewing Plan..."),
  refresh: new TaskDef("Refreshing Plan..."),
  lock: new TaskDef("Locking Plan...", true),
  closing: new TaskDef("Closing Plan...", true),
  opening: new TaskDef("Re-Opening Plan...", true),
  pipeline: new TaskDef("Progressing to Next Stage...", true),
  refreshPlans: new TaskDef("Refreshing Data..."),
  newComment: new TaskDef("Refreshing Comments..."),
  newAction: new TaskDef("Refreshing Actions...", true),
  approve: new TaskDef("Approving Plan...", true),
  reject: (planTitle) => new TaskDef(`Rejecting ${planTitle}`, true),
  notification: () => new TaskDef("Sending Notification", true),
};

export const runningTasks = ko.observableArray();

export const blockingTasks = ko.pureComputed(() => {
  return runningTasks().filter((task) => task.IsBlocking()) ?? [];
});

export const addTask = (taskDef) => {
  // accept either a task or a taskdef;
  let newTask;

  if (taskDef.constructor == Task) {
    newTask = taskDef;
  } else {
    if (taskDef.type) {
      newTask = taskDef.type.Create(taskDef);
    } else {
      newTask = new Task(taskDef);
    }
  }

  runningTasks.push(newTask);
  return newTask;
};

export const finishTask = function (activeTask) {
  if (activeTask) {
    activeTask.markComplete();
    window.setTimeout(() => removeTask(activeTask), 3000);
    // runningTasks.remove(activeTask);
  }
};

const removeTask = function (taskToRemove) {
  runningTasks.remove(taskToRemove);
};
