import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <div class="form-check form-switch">
    <label class="form-check-label"
      ><span class="fw-semibold" data-bind="text: displayName"></span>
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        data-bind="checked: Value"
      />
      <!-- ko if: instructions -->
      <div
        class="fw-lighter fst-italic text-secondary"
        data-bind="html: instructions"
      ></div>
      <!-- /ko -->
    </label>
  </div>
`;

const viewTemplate = html`
  <div class="form-check form-switch">
    <label class="form-check-label"
      ><span class="fw-semibold" data-bind="text: displayName"></span>
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        data-bind="checked: Value"
        disabled
      />
    </label>
  </div>
`;

export class CheckboxModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  static viewTemplate = viewTemplate;
  static editTemplate = editTemplate;

  static view = "checkbox-view";
  static edit = "checkbox-edit";
  static new = "checkbox-edit";
}

registerFieldComponents(CheckboxModule);
