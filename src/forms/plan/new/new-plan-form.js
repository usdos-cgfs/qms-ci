import { BaseForm } from "../../../sal/components/forms/index.js";
import { BusinessOffice, Plan } from "../../../entities/index.js";
import {
  directRegisterComponent,
  html,
} from "../../../sal/infrastructure/index.js";
import { addNewPlan } from "../../../services/plan-service.js";

const componentName = "new-plan-form";

export class NewPlanForm extends BaseForm {
  constructor({ entity = new Plan(), onComplete }) {
    super({ entity, view: Plan.Views.New });

    this.onComplete = onComplete;

    const _entity = ko.unwrap(entity);
    if (!_entity) return;
    _entity.BusinessOffice.Value.subscribe(this.officeLocationChangeHandler);
    _entity.CGFSLocation.Value.subscribe(this.officeLocationChangeHandler);
  }

  officeLocationChangeHandler = (newVal) => {
    if (!newVal) return;
    const entity = ko.unwrap(this.entity);
    if (!entity) return;
    const office = ko.unwrap(entity.BusinessOffice.Value);
    const location = ko.unwrap(entity.CGFSLocation.Value);
    if (!office || !location) return;

    entity.QAO.set(office.QAO.get());
    entity.QSO.set(office.getQSOByLocation(location)?.get());
  };

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
      const result = await addNewPlan(entity);
      this.onComplete(SP.UI.DialogResult.OK);
    } catch (e) {
      alert(e);
    }
  }

  params = this;
  componentName = componentName;
}

const template = html`
  <div class="app-form">
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
        Create CAR/CAP
      </button>
    </div>
  </div>
`;

directRegisterComponent(componentName, {
  template,
});
