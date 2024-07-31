import { FormDisplayModes } from "../../../enums/display_modes.js";
import { DomainError } from "../../../primitives/index.js";
import { Result } from "../../../shared/index.js";
import { BaseForm, html } from "../index.js";
import { appContext } from "../../../../infrastructure/app-db-context.js";

const componentName = "default-constrained-entity-form";

/**
 * Combines functionality for View, Edit, Disp in one component.
 */
export class DefaultForm extends BaseForm {
  constructor({ entity, view, displayMode, onSubmit }) {
    super({ entity, view });
    // this.entityView = new ConstrainedEntityView({ entity, view });
    this.displayMode(displayMode);

    if (onSubmit) this._submitAction = onSubmit;
  }

  // Default submit action:
  // Add, Edit based on displayMode
  _submitAction = () => {
    const entity = ko.unwrap(this.entity);

    // guess the default action for this form type;
    const entitySet = appContext.Set(entity.constructor);
    if (!entitySet)
      return Result.Failure(
        new DomainError({
          source: "default-form",
          entity,
          description: "Could not find entityset",
        })
      );

    const displayMode = ko.unwrap(this.displayMode);
    const view = ko.unwrap(this.view);

    switch (displayMode) {
      case FormDisplayModes.new:
        return entitySet.AddEntity(entity);
      case FormDisplayModes.edit:
        return entitySet.UpdateEntity(entity, view);
    }

    return Result.Success("Nothing to do");
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
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
            name: components[$parent.displayMode()], params: $data}, 
            class: classList"
      ></div>
    </div>
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
