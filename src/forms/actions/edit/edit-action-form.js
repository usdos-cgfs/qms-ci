import { BaseForm } from "../../../sal/components/forms/index.js";
import { BusinessOffice, Plan } from "../../../entities/index.js";
import {
  directRegisterComponent,
  html,
} from "../../../sal/infrastructure/index.js";
import { editAction } from "../../../services/actions-service.js";

const componentName = "edit-action-form";

export class EditActionForm extends BaseForm {
  constructor({ entity, plan, view, onComplete }) {
    super({ entity, view });

    this.onComplete = onComplete;
    this._plan = plan;
  }

  showStageWarning = ko.pureComputed(() => {
    const stage = ko.unwrap(this._plan.ProcessStage.Value);
    return !["Developing Action Plan", "Pending QSO Plan Approval"].includes(
      stage
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
      const result = await editAction(entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result.error);
    } catch (e) {
      alert(e);
    }
  }

  params = this;
  componentName = componentName;
}

const template = html`
  <div class="app-form">
    <!-- ko if: showStageWarning -->
    <div class="alert alert-warning fw-bold">
      Editing this action will require re-approval by the QSO.
    </div>
    <!-- /ko -->
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
        name: components.new, params: $data}, 
        class: classList"
      ></div>
    </div>
    <div class="form-actions">
      <button
        type="button"
        class="btn btn-success"
        data-bind="click: clickSubmit"
      >
        Submit
      </button>
    </div>
  </div>
`;

directRegisterComponent(componentName, {
  template,
});
