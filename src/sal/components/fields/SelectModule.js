import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <!-- ko if: multiple -->
    <select
      class="form-select"
      name=""
      id=""
      multiple="true"
      data-bind="options: Options, 
        optionsCaption: 'Select...', 
        optionsText: optionsText,
        selectedOptions: Value,
        class: ValidationClass"
    ></select>
    <div class="fst-italic fw-light">Hold ctrl to select multiple.</div>
    <!-- /ko -->
    <!-- ko ifnot: multiple -->
    <select
      class="form-select"
      name=""
      id=""
      data-bind="options: Options, 
        optionsCaption: 'Select...', 
        optionsText: optionsText,
        value: Value,
        class: ValidationClass"
    ></select>
    <!-- /ko -->
    <!-- ko if: instructions -->
    <div
      class="fw-lighter fst-italic text-secondary"
      data-bind="html: instructions"
    ></div>
    <!-- /ko -->
  </label>
  <!-- ko if: ShowErrors -->
  <!-- ko foreach: Errors -->
  <div class="fw-semibold text-danger" data-bind="text: description"></div>
  <!-- /ko -->
  <!-- /ko -->
`;

export class SelectModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  static editTemplate = editTemplate;

  static view = "select-view";
  static edit = "select-edit";
  static new = "select-edit";
}

registerFieldComponents(SelectModule);
