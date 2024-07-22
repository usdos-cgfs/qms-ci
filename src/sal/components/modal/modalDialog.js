import { directRegisterComponent } from "../../infrastructure/index.js";
import { modalDialogTemplate } from "./ModalDialogTemplate.js";

const componentName = "modal-dialog-component";

export const currentDialogs = ko.observableArray();

export let toggle;

export function showModalDialog(dialogOptions) {
  currentDialogs.push(dialogOptions);
}

class ModalDialogModule {
  constructor(dialogOpts) {
    this.dialogOpts = dialogOpts;
    this.title = dialogOpts.title;
    this.dialogReturnValueCallback = dialogOpts.dialogReturnValueCallback;

    this.form = dialogOpts.form;

    if (this.form?.onComplete) {
      alert("Pass the form onComplete to the modal dialog!");
      return;
    }
    this.form.onComplete = this.close.bind(this);

    toggle = this.toggle;
  }

  toggle = (show = null) => {
    if (show == null) show = !this.dlgElement.hasAttribute("open");

    show ? this.showModal() : this.hide();
  };

  showModal = () => {
    this.dlgElement.showModal();
    this.dlgElement.classList.add("active");
  };

  clickClose = () => {
    this.close(false);
  };

  hide = () => {
    this.dlgElement.close();
    this.dlgElement.classList.remove("active");
  };

  close(result) {
    this.dlgElement.close();
    this.dlgElement.classList.remove("active");
    if (this.dialogReturnValueCallback) this.dialogReturnValueCallback(result);
    currentDialogs.remove(this.dialogOpts);
  }

  _id;
  getUniqueId = () => {
    if (!this._id) {
      this._id = "field-" + Math.floor(Math.random() * 10000);
    }
    return this._id;
  };

  koDescendantsComplete = function (node) {
    this.dlgElement = node.querySelector("dialog");
    dragElement(this.dlgElement);
    resizeDialog(this.dlgElement);
    this.showModal();
  };
}

directRegisterComponent(componentName, {
  template: modalDialogTemplate,
  viewModel: ModalDialogModule,
});

function resizeDialog(elmnt) {
  elmnt.style.width = "550px";
  elmnt.style.height = "";
  elmnt.style.top = "125px";
  elmnt.style.left = (window.GetViewportWidth() - 550) / 2 + "px";
}

// TODO: this should be in a utility class or something
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  // elmnt.style.top = elmnt.style.top

  const dragger = elmnt.querySelector(".grabber");
  if (dragger) {
    // if present, the header is where you move the DIV from:
    dragger.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
