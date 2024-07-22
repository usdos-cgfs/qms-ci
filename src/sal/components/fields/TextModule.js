import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <input
      class="form-control"
      data-bind="textInput: Value, class: ValidationClass, attr: attr"
    />
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

export class TextModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  static editTemplate = editTemplate;

  static view = "text-view";
  static edit = "text-edit";
  static new = "text-edit";
}

registerFieldComponents(TextModule);
