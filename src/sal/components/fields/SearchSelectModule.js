import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
  </label>
  <search-select
    class="form-select"
    data-bind="searchSelect: { 
      options: Options, 
      selectedOptions: Value,
      optionsText: optionsText,
      onSearchInput: onSearchInput
    }"
  >
  </search-select>
  <div class="fw-light flex justify-between">
    <p class="fst-italic"></p>
    <button type="button" class="btn btn-link h-1" data-bind="click: clear">
      CLEAR
    </button>
  </div>
  <!-- ko if: instructions -->
  <div
    class="fw-lighter fst-italic text-secondary"
    data-bind="html: instructions"
  ></div>
  <!-- /ko -->
  <!-- ko if: ShowErrors -->
  <!-- ko foreach: Errors -->
  <div class="fw-semibold text-danger" data-bind="text: description"></div>
  <!-- /ko -->
  <!-- /ko -->
`;

export class SearchSelectModule extends BaseFieldModule {
  constructor(field) {
    super(field);
    this.Options = field.Options;
    this.Value = field.Value;
    this.optionsText =
      field.optionsText ??
      ((val) => {
        return val;
      });
    this.multiple = field.multiple;
    this.OptionsCaption = field.OptionsCaption ?? "Select...";
    this.onSearchInput = field.onSearchInput;
  }

  GetSelectedOptions = ko.pureComputed(() => {
    if (this.multiple) return this.Value();

    return this.Value() ? [this.Value()] : [];
  });

  InputGroupFocused = ko.observable();
  setFocus = () => this.InputGroupFocused(true);

  FilterText = ko.observable();
  FilteredOptions = ko.pureComputed(() =>
    this.Options().filter((option) => {
      if (this.GetSelectedOptions().indexOf(option) >= 0) return false;
      if (this.FilterText())
        return this.optionsText(option)
          .toLowerCase()
          .includes(this.FilterText().toLowerCase());
      return true;
    })
  );

  addSelection = (option, e) => {
    console.log("selected", option);
    if (e.target.nextElementSibling) {
      //e.stopPropagation();
      e.target.nextElementSibling.focus();
    }
    if (this.multiple) {
      this.Value.push(option);
    } else {
      this.Value(option);
    }
  };

  removeSelection = (option) =>
    this.multiple ? this.Value.remove(option) : this.Value(null);

  setInputGroupFocus = () => {
    this.InputGroupFocused(true);
    clearTimeout(this.focusOutTimeout);
  };

  removeInputGroupFocus = (data, e) => {
    this.focusOutTimeout = window.setTimeout(() => {
      this.InputGroupFocused(false);
    }, 0);
  };

  static editTemplate = editTemplate;

  static view = "search-select-view";
  static edit = "search-select-edit";
  static new = "search-select-new";
}

registerFieldComponents(SearchSelectModule);
