import * as ko from "knockout";
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
  <query-select
    class="form-select"
    data-bind="querySelect: { 
      searchFunction: searchFunction,
      selectedOptions: Value,
      optionsText: optionsText,
      onSearchInput: onSearchInput,
      setValueFromOpts: setValueFromOpts,
    }, attr: { multiple: multiple }"
  >
  </query-select>
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

export class QuerySelectModule extends BaseFieldModule {
  constructor(field) {
    super(field);
    this.Value = field.Value;
    this.optionsText =
      field.optionsText ??
      ((val) => {
        return val;
      });
    this.multiple = field.multiple;
    this.OptionsCaption = field.OptionsCaption ?? "Select...";
    this.onSearchInput = field.onSearchInput;
    this.entitySet = field.entitySet;
    this.lookupCol = field.lookupCol ?? "Title";
    this.findOrCreateNewEntity = field.findOrCreateNewEntity;
  }

  searchFunction = async (searchText) => {
    const results = await this.entitySet.FindByColumnValue(
      [`startswith(${this.lookupCol},'${searchText}')`],
      {},
      { count: 10 },
      ["ID", "Title", this.lookupCol]
    );
    return results.results ?? [];
  };

  mapOptToEntity = (option) => {
    const newMap = { ID: option.value };
    newMap[this.lookupCol] = option.label;
    return this.findOrCreateNewEntity(newMap);
  };

  setValueFromOpts = (options) => {
    if (!options || !options.length) {
      this.Value(null);
      return;
    }

    if (this.multiple) {
      this.Value(options.map(this.mapOptToEntity));
    } else {
      this.Value(this.mapOptToEntity(options[0]));
    }
  };

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

  static view = "query-select-view";
  static edit = "query-select-edit";
  static new = "query-select-new";
}

registerFieldComponents(QuerySelectModule);
