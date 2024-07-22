import { html } from "../../infrastructure/index.js";

export const modalDialogTemplate = html`
  <dialog
    id=""
    class="draggable sal-modal-dialog"
    data-bind="attr: {id: getUniqueId() }"
  >
    <!-- Can't use 'with: currentDialog' since we need to register our 
      javascript event listeners for grabbing and resizing -->
    <div class="modal-dialog-header grabber">
      <h2 class="modal-dialog-title" data-bind="text: title"></h2>
      <h2 class="modal-dialog-title">
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
      class="modal-dialog-body"
      data-bind="component: { name: form.componentName, params: form.params }"
    ></div>
    <div class="modal-dialog-actions">
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

  <style>
    .sal-modal-dialog {
      display: none;
      position: absolute;
      z-index: 15;
      width: 615px;
      min-width: 400px;
      max-height: 85vh;
      padding: 0;
      margin: 0;
      top: 125px;
      resize: both;

      border: 2px solid var(--primary-color);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
    }

    .sal-modal-dialog.active {
      display: flex;
    }

    .sal-modal-dialog .modal-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* background-color: inherit; */
      /* position: sticky;
      top: 0; */
      padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    }

    .sal-modal-dialog .modal-dialog-title {
      color: inherit;
      margin: 0;
    }

    .sal-modal-dialog .modal-dialog-body {
      padding: 0.5rem 1.5rem;
      overflow: auto;
    }

    .sal-modal-dialog .modal-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: auto;
      padding: 0.5rem 1.5rem 1.5rem 1.5rem;
    }

    .draggable {
      position: absolute;
    }

    .draggable .grabber {
      cursor: move;
    }
  </style>
`;
