import { ProgressTask, Task, TaskDef } from "../value-objects/task.js";

export const tasks = {
  init: new Task({ msg: "Initializing the Application" }),
  save: new Task({ msg: "Saving Plan...", blocking: true }),
  cancelAction: new Task({ msg: "Cancelling Action..." }),
  view: new Task({ msg: "Viewing Plan..." }),
  refresh: new Task({ msg: "Refreshing Plan..." }),
  lock: new Task({ msg: "Locking Plan...", blocking: true }),
  closing: new Task({ msg: "Closing Plan...", blocking: true }),
  opening: new Task({ msg: "Re-Opening Plan...", blocking: true }),
  pipeline: new Task({ msg: "Progressing to Next Stage...", blocking: true }),
  refreshPlans: new Task({ msg: "Refreshing Data..." }),
  newComment: new Task({ msg: "Refreshing Comments..." }),
  newAction: new Task({ msg: "Refreshing Actions...", blocking: true }),
  approve: new Task({ msg: "Approving Plan...", blocking: true }),
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
