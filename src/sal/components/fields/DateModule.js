import * as ko from "knockout";
import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

export const dateFieldTypes = {
  date: "date",
  datetime: "datetime-local",
};

const editTemplate = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <input
      class="form-control"
      data-bind="value: inputBinding, 
        class: ValidationClass, 
        attr: {'type': type},
        enable: Enable"
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

export class DateModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  toInputDateString = () => this.Value().format("yyyy-MM-dd");

  toInputDateTimeString = () => this.Value().format("yyyy-MM-ddThh:mm");

  inputBinding = ko.pureComputed({
    read: () => {
      if (!this.Value()) return null;
      switch (this.type) {
        case dateFieldTypes.date:
          return this.toInputDateString();
        case dateFieldTypes.datetime:
          return this.toInputDateTimeString();
        default:
          return null;
      }
    },
    write: (val) => {
      if (!val) return;
      //writes in format
      if (this.type == dateFieldTypes.datetime) {
        this.Value(new Date(val));
        return;
      }

      // make sure we're using midnight local time
      this.Value(new Date(val + "T00:00"));
    },
  });

  static editTemplate = editTemplate;

  static view = "date-view";
  static edit = "date-edit";
  static new = "date-edit";
}

registerFieldComponents(DateModule);
