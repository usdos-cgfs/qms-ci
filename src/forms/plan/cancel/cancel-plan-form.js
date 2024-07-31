import { Plan } from "../../../entities/plan.js";
import { BaseForm, html } from "../../../sal/components/forms/index.js";
import { TextAreaField } from "../../../sal/fields/index.js";
import { directRegisterComponent } from "../../../sal/infrastructure/index.js";
import { cancelPlan } from "../../../services/plan-service.js";

const componentName = "cancel-plan-form";

export class CancelPlanForm extends BaseForm {
  constructor({ entity }) {
    super({ entity, view: Plan.Views.Cancel });
  }

  saving = ko.observable(false);

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
      const result = await cancelPlan(entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result?.error);
    } catch (e) {
      alert(e);
    }
  }

  componentName = componentName;
  params = this;
}

const template = html`
  <div class="app-form">
    <div class="alert alert-warning fw-bold">
      Once cancelled, you must contact QTM if you want to re-open this plan.
    </div>
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
            name: components.edit, params: $data}, 
            class: classList"
      ></div>
    </div>
    <div class="form-actions">
      <button
        type="button"
        class="btn btn-danger"
        data-bind="click: clickSubmit"
      >
        Cancel CAR/CAP
      </button>
    </div>
  </div>
`;

directRegisterComponent(componentName, { template });
