import * as ko from "knockout";
import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <div class="component field">
    <!-- ko if: isRichText -->
    <label class="fw-semibold"
      ><span data-bind="text: displayName"></span
      ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span
      >:</label
    >
    <!-- ko if: instructions -->
    <div
      class="fw-lighter fst-italic text-secondary"
      data-bind="html: instructions"
    ></div>
    <!-- /ko -->
    <!-- ko ifnot: Enable -->
    <div data-bind="html: Value"></div>
    <!-- /ko -->
    <!-- ko if: Enable -->
    <div
      class="richtext-field"
      data-bind="childrenComplete: childrenHaveLoaded"
    >
      <!-- Create the editor container -->
      <div
        class="form-control"
        data-bind="attr: {'id': getUniqueId()}, 
          class: ValidationClass, 
          richText: Value"
        style="height: 150px"
      >
        <div data-bind=""></div>
      </div>
    </div>
    <!-- /ko -->
    <!-- ko ifnot: isRichText -->
    <label class="fw-semibold"
      ><span data-bind="text: displayName"></span
      ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
      <!-- ko if: instructions -->
      <div
        class="fw-lighter fst-italic text-secondary"
        data-bind="html: instructions"
      ></div>
      <!-- /ko -->
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        class="form-control"
        data-bind="textInput: Value, 
        class: ValidationClass, 
        attr: attr
        enable: Enable"
      ></textarea>
    </label>
    <!-- /ko -->
    <!-- /ko -->
    <!-- ko if: ShowErrors -->
    <!-- ko foreach: Errors -->
    <div class="fw-semibold text-danger" data-bind="text: description"></div>
    <!-- /ko -->
    <!-- /ko -->
  </div>
`;

const viewTemplate = html`
  <div class="fw-semibold" data-bind="text: displayName"></div>
  <!-- ko if: Value -->
  <!-- ko if: isRichText -->
  <div data-bind="html: Value"></div>
  <!-- /ko -->
  <!-- ko ifnot: isRichText -->
  <div data-bind="text: Value"></div>
  <!-- /ko -->
  <!-- /ko -->
  <!-- ko ifnot: Value -->
  <div class="fst-italic">Not provided.</div>
  <!-- /ko -->
`;

export class TextAreaModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  childrenHaveLoaded = (nodes) => {
    // this.initializeEditor();
  };

  getToolbarId = () => "toolbar-" + this.getUniqueId();

  static viewTemplate = viewTemplate;
  static editTemplate = editTemplate;

  static view = "text-area-view";
  static edit = "text-area-edit";
  static new = "text-area-edit";
}

registerFieldComponents(TextAreaModule);
