import { FormDisplayModes } from "../../../enums/display_modes.js";
import { DomainError } from "../../../primitives/index.js";
import { Result } from "../../../shared/index.js";
import { BaseForm, html } from "../index.js";
import { appContext } from "../../../../infrastructure/app-db-context.js";

const componentName = "default-upload-constrained-entity-form";

function getFileTitle(filename) {
  // Find the position of the last dot in the filename
  const lastDotIndex = filename.lastIndexOf(".");

  // If there is no dot, return the whole filename
  if (lastDotIndex === -1) {
    return filename;
  }

  // Return the part of the filename before the last dot
  return filename.substring(0, lastDotIndex);
}

/**
 * Combines functionality for View, Edit, Disp in one component.
 */
export class DefaultUploadForm extends BaseForm {
  constructor({ entity, view, folderPath }) {
    super({ entity, view });
    // this.entityView = new ConstrainedEntityView({ entity, view });
    this.displayMode(FormDisplayModes.new);

    this.folderPath = folderPath;

    this.files.subscribeAdded(this.onFileAttachedHandler);
  }

  files = ko.observableArray();
  file = ko.observable();

  onFileAttachedHandler = async (newFiles) => {
    if (!newFiles.length) return;

    const newFile = newFiles[0];
    this.file(newFile);

    const entity = ko.unwrap(this.entity);
    entity.FileName.Value(newFile.name);
    entity.Title.Value(getFileTitle(newFile.name));
  };

  // Default submit action:
  // Add, Edit based on displayMode
  _submitAction = () => {
    const entity = ko.unwrap(this.entity);

    const entitySet = appContext.Set(entity.constructor);
    if (!entitySet)
      return Result.Failure(
        new DomainError({
          source: "default-form",
          entity,
          description: "Could not find entityset",
        })
      );

    const file = ko.unwrap(this.file);
    const folderPath = ko.unwrap(this.folderPath);
    const view = ko.unwrap(this.view);

    return entitySet.UploadFileWithEntity({
      file,
      entity,
      folderPath,
      view,
    });
  };

  displayMode = ko.observable();

  showSubmitButton = ko.pureComputed(() => {
    return (
      this._submitAction &&
      ko.unwrap(this.displayMode) !== FormDisplayModes.view
    );
  });

  async clickSubmit() {
    this.saving(true);
    await this.submit();
    this.saving(false);
  }

  async submit() {
    const errors = this.validate();
    if (errors.length) return;

    const entity = ko.unwrap(this.entity);

    try {
      const result = await this._submitAction(entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result?.error);
    } catch (e) {
      alert(e);
    }
  }

  clickCancel() {}

  clickClear() {}

  params = this;
  componentName = componentName;
}

const template = html`
  <div class="app-form">
    <div class="form-fields vertical">
      <label class="file-upload-field">
        Upload Documents:
        <div class="dropzone" data-bind="">Drop Files Here</div>
        <input class="file-upload" type="file" data-bind="files: files" />
      </label>
    </div>
    <!-- ko if: file -->
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
            name: components[$parent.displayMode()], params: $data}, 
            class: classList"
      ></div>
    </div>
    <!-- /ko -->
    <div class="form-actions">
      <!-- ko if: showSubmitButton -->
      <button
        type="button"
        class="btn btn-success"
        data-bind="click: clickSubmit"
      >
        Submit
      </button>
      <!-- /ko -->
    </div>
  </div>
`;

ko.components.register(componentName, {
  template,
});
