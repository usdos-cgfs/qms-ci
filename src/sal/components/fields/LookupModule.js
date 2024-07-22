import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <!-- ko if: isSearch -->
    <div data-bind="text: toString()"></div>
    <input class="form-control" data-bind="" />
    <!-- /ko -->
    <!-- ko ifnot: isSearch -->
    <!-- ko if: Options().length -->
    <!-- ko if: multiple -->
    <select
      class="form-select"
      name=""
      id=""
      multiple="true"
      data-bind="options: Options, 
  selectedOptions: Value,
  optionsText: optionsText,
  class: ValidationClass"
    ></select>
    <div class="fw-light flex justify-between">
      <p class="fst-italic">Hold ctrl to select multiple</p>
      <button type="button" class="btn btn-link h-1" data-bind="click: clear">
        CLEAR
      </button>
    </div>
    <!-- /ko -->
    <!-- ko ifnot: multiple -->
    <select
      class="form-select"
      name=""
      id=""
      data-bind="options: Options, 
    optionsCaption: 'Select...', 
    value: Value,
    optionsText: optionsText,
    class: ValidationClass"
    ></select>
    <!-- /ko -->
    <!-- /ko -->
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

export class LookupModule extends BaseFieldModule {
  constructor(field) {
    super(field);
    this.onSearchInput = field.onSearchInput;
    this.multiple = field.multiple ?? false;
  }

  // selectedOptions = ko.pureComputed({
  //   read: () => {
  //     if (this.multiple) return this.Value();
  //     return ko.unwrap(this.Value) ? [ko.unwrap(this.Value)] : [];
  //   },
  //   write: (val) => {
  //     if (this.multiple) {
  //       this.Value(val);
  //       return;
  //     }

  //     if (val.length) {
  //       this.Value(val[0]);
  //       return;
  //     }
  //     this.Value(null);
  //   },
  // });

  static editTemplate = editTemplate;

  static view = "lookup-view";
  static edit = "lookup-edit";
  static new = "lookup-edit";
}

registerFieldComponents(LookupModule);
