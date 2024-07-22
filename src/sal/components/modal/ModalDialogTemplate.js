import { html } from "../../infrastructure/index.js";

export const modalDialogTemplate = html`
  <dialog
    id=""
    class="card bg-dark draggable modal-dialog"
    data-bind="attr: {id: getUniqueId() }"
  >
    <!-- Can't use 'with: currentDialog' since we need to register our 
      javascript event listeners for grabbing and resizing -->
    <div class="card-header bg-dark grabber">
      <h2 class="card-title" data-bind="text: title"></h2>
      <h2 class="card-title">
        <i class="fa-solid fa-xmark pointer" data-bind="click: clickClose"></i>
      </h2>
    </div>
    <div class="dimmer" data-bind="css: {'active': form.saving }">
      <span class="loader"></span>
      <ul class="" data-bind="foreach: $root.blockingTasks">
        <li data-bind="text: msg + '...'"></li>
      </ul>
    </div>
    <div
      class="card-body"
      data-bind="component: { name: form.componentName, params: form.params }"
    ></div>
    <div class="card-actions">
      <button
        style
        type="button"
        class="btn btn-danger"
        data-bind="click: clickClose"
      >
        Cancel
      </button>
    </div>
  </dialog>
`;
