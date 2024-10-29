// src/common/router.js
var state = {};
window.history.replaceState({}, "", document.location.href);
function setUrlParam(param, newVal) {
  if (getUrlParam(param) == newVal) return;
  const search = window.location.search;
  const regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  const query = search.replace(regex, "$1").replace(/&$/, "");
  const urlParams = (query.length > 2 ? query + "&" : "?") + (newVal ? param + "=" + newVal : "");
  state[param] = newVal;
  window.history.pushState(state, "", urlParams.toString());
}
function getUrlParam(param) {
  const results = new RegExp("[?&]" + param + "=([^&#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
}

// src/components/tabs/tabs.js
var TabsModule = class {
  constructor(tabOpts, urlParam = "tab") {
    this.urlParam = urlParam;
    ko.utils.arrayPushAll(this.tabOpts, tabOpts);
    this.selectedTab.subscribe(this.tabChangeHandler);
    window.addEventListener("popstate", this.popStateHandler);
    const defaultTabId = getUrlParam(urlParam);
    if (defaultTabId) {
      this.selectById(defaultTabId);
    }
  }
  tabOpts = ko.observableArray();
  selectedTab = ko.observable();
  visibleTabs = ko.pureComputed(() => {
    const visibleTabs = this.tabOpts().filter((tab) => tab.visible());
    return visibleTabs;
  });
  isSelected = (tab) => {
    return tab.id == this.selectedTab()?.id;
  };
  clickTabLink = (tab) => {
    this.selectedTab(tab);
  };
  selectTab = (tab) => this.selectById(tab?.id);
  selectById = (tabId) => {
    const tabById = this.tabOpts().find((tab) => tab.id == tabId) ?? this.getDefaultTab();
    this.selectedTab(tabById);
  };
  selectDefault = () => {
    this.selectedTab(this.getDefaultTab());
  };
  getDefaultTab = () => this.visibleTabs()[0];
  tabChangeHandler = (newTab) => {
    if (newTab) setUrlParam(this.urlParam, newTab.id);
  };
  popStateHandler = (event) => {
    if (event.state) {
      if (event.state[this.urlParam])
        this.selectById(event.state[this.urlParam]);
    }
  };
};
var Tab = class {
  constructor({ urlKey, linkText, template: template6, visible = true }) {
    this.id = urlKey;
    this.linkText = linkText;
    this.template = template6;
    this.isVisible = visible;
  }
  visible = ko.pureComputed(() => {
    return ko.unwrap(this.isVisible);
  });
};

// src/common/data-table.js
function makeDataTable(tableId) {
  tableId = tableId.startsWith("#") ? tableId.substring(1) : tableId;
  const elm = document.getElementById(tableId);
  if (!elm) return;
  elm.classList.add("table", "table-striped", "table-hover", "w-100");
  return new DataTable(elm, {
    dom: "<'ui stackable grid'<'row'<'eight wide column'l><'right aligned eight wide column'f>><'row dt-table'<'sixteen wide column'tr>><'row'<'six wide column'i><'d-flex justify-content-center'B><'right aligned six wide column'p>>>",
    buttons: ["copy", "csv", "excel", "pdf", "print"],
    bSortCellsTop: true,
    order: [[4, "desc"]],
    iDisplayLength: 25,
    deferRender: true,
    bDestroy: true,
    // columnDefs: [{ width: "10%", targets: 0 }],
    initComplete: function() {
      this.api().columns().every(function() {
        var column = this;
        var tbl = $(column.header()).closest("table");
        var filterCell = tbl.find("thead tr:eq(1) th").eq(column.index());
        var select = $(
          '<search-select class=""><option value=""></option></search-select>'
        );
        switch (filterCell.attr("data-filter")) {
          case "select-filter":
            select.attr("multiple", "true");
          case "single-select-filter":
            select.appendTo(filterCell.empty()).on("change", function() {
              var vals = this.selectedOptions.map((opt) => opt.value);
              if (!vals) {
                vals = [];
              } else {
                vals = vals.map(function(value) {
                  return value ? "^" + $.fn.dataTable.util.escapeRegex(value) + "$" : null;
                });
              }
              var val = vals.join("|");
              column.search(val, true, false).draw();
            });
            let options = "";
            column.data().unique().sort().each(function(optionText, j) {
              try {
                let parsedElement = $(optionText);
                if (parsedElement.is("a")) {
                  optionText = parsedElement.text();
                }
              } catch (e) {
              }
              options += `<option value="${optionText}" title="${optionText}">${optionText}</option>`;
            });
            select.append(options);
            break;
          case "search-filter":
            $(
              '<div class=""><input class="form-control" type="text" placeholder="Search..." style="width: 100%"/></div>'
            ).appendTo(filterCell.empty()).on("keyup change clear", function() {
              const inputSearchText = this.getElementsByTagName("input")[0].value;
              if (column.search() !== inputSearchText) {
                column.search(inputSearchText).draw();
              }
            });
            break;
          case "bool-filter":
            var checkbox = $('<input type="checkbox"></input>').appendTo(filterCell.empty()).change(function() {
              if (this.checked) {
                column.search("true").draw();
              } else {
                column.search("").draw();
              }
            });
            break;
          default:
        }
        if (filterCell.attr("clear-width")) {
          tbl.find("thead tr:eq(0) th").eq(column.index()).width("");
        }
      });
    }
  });
}

// src/sal/infrastructure/entity_utilities.js
var sortByTitle = (a, b) => {
  if (a.Title > b.Title) {
    return 1;
  }
  if (a.Title < b.Title) {
    return -1;
  }
  return 0;
};

// src/sal/entities/People.js
var People2 = class _People {
  constructor({
    ID,
    Title,
    LoginName = null,
    Email = null,
    IsGroup = null,
    IsEnsured = false
  }) {
    this.ID = ID;
    this.Title = Title;
    this.LookupValue = Title;
    this.LoginName = LoginName != "" ? LoginName : null;
    this.Email = Email;
    this.IsGroup = IsGroup;
    this.IsEnsured = IsEnsured;
  }
  ID = null;
  Title = null;
  LoginName = null;
  LookupValue = null;
  Email = null;
  getKey = () => this.LoginName ?? this.Title;
  static Create = function(props) {
    if (!props || !props.ID && !(props.Title || props.LookupValue))
      return null;
    return new _People({
      ...props,
      Title: props.Title ?? props.LookupValue
    });
  };
};

// src/sal/primitives/entity.js
var Entity = class {
  constructor(params) {
    if (params?.ID) this.ID = params.ID;
    if (params?.Title) this.Title = params.Title;
  }
  ObservableID = ko.observable();
  ObservableTitle = ko.observable();
  get id() {
    return this.ObservableID();
  }
  set id(val) {
    this.ObservableID(val);
  }
  get Title() {
    return this.ObservableTitle();
  }
  set Title(val) {
    this.ObservableTitle(val);
  }
};

// src/sal/primitives/validation_error.js
var ValidationError2 = class {
  constructor(source, type, description) {
    this.source = source;
    this.type = type;
    this.description = description;
  }
};

// src/sal/fields/BaseField.js
var BaseField = class {
  constructor({
    displayName,
    systemName,
    instructions = null,
    isRequired = false,
    defaultValue,
    width,
    classList = [],
    isVisible = true,
    isEditable = true
  }) {
    this.displayName = displayName;
    this.systemName = systemName;
    this.instructions = instructions;
    this.isRequired = isRequired;
    this.Visible = ko.pureComputed(() => {
      return ko.unwrap(isVisible);
    });
    this.Enable = ko.pureComputed(() => {
      return ko.unwrap(isEditable);
    });
    this.width = width ? "col-md-" + width : "col-md-6";
    this.classList = classList;
    if (defaultValue) this.Value(defaultValue);
    this.addFieldRequirement(isRequiredValidationRequirement(this));
  }
  Value = ko.observable();
  get = () => this.Value();
  set = (val) => this.Value(val);
  clear = () => {
    if (ko.isObservableArray(this.Value)) this.Value([]);
    else this.Value(null);
  };
  toString = ko.pureComputed(() => this.Value());
  toJSON = () => this.Value();
  fromJSON = (val) => this.Value(val);
  validate = (showErrors = true) => {
    this.ShowErrors(showErrors);
    return this.Errors();
  };
  _fieldValidationRequirements = ko.observableArray();
  Errors = ko.pureComputed(() => {
    if (!this.Visible()) return [];
    const errors = this._fieldValidationRequirements().filter((req) => req.requirement()).map((req) => req.error);
    return errors;
  });
  addFieldRequirement = (requirement) => this._fieldValidationRequirements.push(requirement);
  IsValid = ko.pureComputed(() => !this.Errors().length);
  ShowErrors = ko.observable(false);
  ValidationClass = ko.pureComputed(() => {
    if (!this.ShowErrors()) return;
    return this.Errors().length ? "is-invalid" : "is-valid";
  });
};
function isRequiredValidationRequirement(field) {
  return {
    requirement: ko.pureComputed(() => {
      const isRequired = ko.unwrap(field.isRequired);
      if (!isRequired) return false;
      const value = ko.unwrap(field.Value);
      if (value?.constructor == Array) return !value.length;
      return value === null || value === void 0;
    }),
    error: new ValidationError2(
      "text-field",
      "required-field",
      `${ko.utils.unwrapObservable(field.displayName)} is required!`
    )
  };
}

// src/sal/components/fields/BaseFieldModule.js
var html = String.raw;
function registerFieldComponents(constructor) {
  ko.components.register(constructor.edit, {
    template: constructor.editTemplate,
    viewModel: constructor
  });
  ko.components.register(constructor.view, {
    template: constructor.viewTemplate,
    viewModel: constructor
  });
}
var viewTemplate = html`
  <div class="fw-semibold" data-bind="text: displayName"></div>
  <div data-bind="text: toString()"></div>
`;
var editTemplate = html`<div>Uh oh!</div>`;
var BaseFieldModule = class {
  constructor(params) {
    Object.assign(this, params);
  }
  _id;
  getUniqueId = () => {
    if (!this._id) {
      this._id = "field-" + Math.floor(Math.random() * 1e4);
    }
    return this._id;
  };
  Errors = ko.pureComputed(() => {
    if (!this.ShowErrors()) return [];
    if (!this.isRequired) return [];
    return this.Value() ? [] : [
      new ValidationError(
        "text-field",
        "required-field",
        this.displayName + ` is required!`
      )
    ];
  });
  ShowErrors = ko.observable(false);
  ValidationClass = ko.pureComputed(() => {
    if (!this.ShowErrors()) return;
    return this.Errors().length ? "is-invalid" : "is-valid";
  });
  static viewTemplate = viewTemplate;
  static editTemplate = editTemplate;
};

// src/sal/components/fields/BlobModule.js
var editTemplate2 = html`
  <h5>
    <span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
  </h5>
  <!-- ko ifnot: entityType -->
  <div class="alert alert-danger">Missing entity type</div>
  <!-- /ko -->
  <!-- ko if: entityType -->
  <!-- ko ifnot: multiple -->
  <div
    data-bind="component: {name: Value()?.components.edit, params: {Entity: Value()}}"
  ></div>
  <!-- /ko -->
  <!-- ko if: multiple -->
  <table class="table">
    <thead>
      <tr data-bind="">
        <!-- ko foreach: Cols -->
        <th data-bind="text: displayName"></th>
        <!-- /ko -->
        <th>Actions</th>
      </tr>
    </thead>
    <tbody data-bind="">
      <!-- ko foreach: {data: Value, as: 'row'} -->
      <tr data-bind="">
        <!-- ko foreach: {data: row.FormFields, as: 'col'} -->
        <td data-bind="text: col.toString"></td>
        <!-- /ko -->
        <td>
          <i
            title="remove item"
            class="fa-solid fa-trash pointer"
            data-bind="click: $parent.remove.bind(row)"
          ></i>
        </td>
      </tr>
      <!-- /ko -->
      <tr>
        <!-- ko foreach: NewItem()?.FormFields -->
        <td>
          <div
            data-bind="component: {name: components.edit, params: $data}"
          ></div>
        </td>
        <!-- /ko -->
        <td class="align-bottom">
          <button
            title="add and new"
            type="button"
            data-bind="click: submit"
            class="btn btn-success"
          >
            Add +
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- /ko -->
  <!-- /ko -->
`;
var viewTemplate2 = html`
  <h5>
    <span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
  </h5>
  <!-- ko ifnot: entityType -->
  <div class="alert alert-danger">Missing entity type</div>
  <!-- /ko -->
  <!-- ko if: entityType -->
  <!-- ko ifnot: multiple -->
  <!-- ko if: Value -->
  <div
    data-bind="component: {name: Value().components.view, params: {Entity: Value()}}"
  ></div>
  <!-- /ko -->
  <!-- /ko -->
  <!-- ko if: multiple -->
  <table class="table">
    <thead>
      <tr data-bind="">
        <!-- ko foreach: Cols -->
        <th data-bind="text: displayName"></th>
        <!-- /ko -->
      </tr>
    </thead>
    <tbody data-bind="">
      <!-- ko foreach: {data: Value, as: 'row'} -->
      <tr data-bind="">
        <!-- ko foreach: {data: row.FormFields, as: 'col'} -->
        <td data-bind="text: col.toString()"></td>
        <!-- /ko -->
      </tr>
      <!-- /ko -->
    </tbody>
  </table>
  <!-- /ko -->
  <!-- /ko -->
`;
var BlobModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  static viewTemplate = viewTemplate2;
  static editTemplate = editTemplate2;
  static view = "blob-view";
  static edit = "blob-edit";
  static new = "blob-edit";
};
registerFieldComponents(BlobModule);

// src/sal/components/fields/CheckboxModule.js
var editTemplate3 = html`
  <div class="form-check form-switch">
    <label class="form-check-label"
      ><span class="fw-semibold" data-bind="text: displayName"></span>
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        data-bind="checked: Value, enable: Enable"
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
var viewTemplate3 = html`
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
var CheckboxModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  static viewTemplate = viewTemplate3;
  static editTemplate = editTemplate3;
  static view = "checkbox-view";
  static edit = "checkbox-edit";
  static new = "checkbox-edit";
};
registerFieldComponents(CheckboxModule);

// src/sal/components/fields/DateModule.js
var editTemplate4 = html`
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
var DateModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  static editTemplate = editTemplate4;
  static view = "date-view";
  static edit = "date-edit";
  static new = "date-edit";
};
registerFieldComponents(DateModule);

// src/sal/components/fields/LookupModule.js
var editTemplate5 = html`
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
        class: ValidationClass
        enable: Enable"
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
        class: ValidationClass
        enable: Enable"
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
var LookupModule = class extends BaseFieldModule {
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
  static editTemplate = editTemplate5;
  static view = "lookup-view";
  static edit = "lookup-edit";
  static new = "lookup-edit";
};
registerFieldComponents(LookupModule);

// src/sal/components/fields/PeopleModule.js
var editTemplate6 = html`
  <label class="fw-semibold w-100"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <!-- ko ifnot: spGroupId -->
    <div
      class="form-control py-0"
      data-bind="attr: {id: getUniqueId()}, 
      people: Value, 
      pickerOptions: pickerOptions,
      class: ValidationClass"
    ></div>
    <!-- /ko -->
    <!-- ko if: ShowUserSelect -->
    <select
      class="form-select"
      name=""
      id=""
      data-bind="options: userOpts, 
        optionsCaption: 'Select...', 
        optionsText: 'Title',
        value: ValueFunc,
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
var viewTemplate4 = html`
  <div class="fw-semibold" data-bind="text: displayName"></div>
  <!-- ko if: toString -->
  <!-- ko ifnot: multiple -->
  <div
    data-bind="text: toString, 
      attr: {title: Value()?.LoginName}"
  ></div>
  <!-- /ko -->
  <!-- ko if: multiple -->
  <ul data-bind="foreach: Value">
    <li data-bind="attr: {title: LoginName}, text: Title"></li>
  </ul>
  <!-- /ko -->
  <!-- /ko -->
  <!-- ko ifnot: toString -->
  <div class="fst-italic">Not provided.</div>
  <!-- /ko -->
`;
var PeopleModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  ValueFunc = ko.pureComputed({
    read: () => {
      if (!this.Value()) return;
      const userOpts = ko.unwrap(this.userOpts);
      return userOpts.find((opt) => opt.ID == this.Value().ID);
    },
    write: (opt) => {
      const userOpts = ko.unwrap(this.userOpts);
      if (!userOpts) return;
      this.Value(opt);
    }
  });
  ShowUserSelect = ko.pureComputed(() => {
    const groupName = this.spGroupName;
    if (!groupName) return false;
    const options = ko.unwrap(this.userOpts);
    return options.length;
  });
  static viewTemplate = viewTemplate4;
  static editTemplate = editTemplate6;
  static view = "people-view";
  static edit = "people-edit";
  static new = "people-edit";
};
registerFieldComponents(PeopleModule);

// src/sal/components/fields/SearchSelectModule.js
var editTemplate7 = html`
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
var SearchSelectModule = class extends BaseFieldModule {
  constructor(field) {
    super(field);
    this.Options = field.Options;
    this.Value = field.Value;
    this.optionsText = field.optionsText ?? ((val) => {
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
  FilteredOptions = ko.pureComputed(
    () => this.Options().filter((option) => {
      if (this.GetSelectedOptions().indexOf(option) >= 0) return false;
      if (this.FilterText())
        return this.optionsText(option).toLowerCase().includes(this.FilterText().toLowerCase());
      return true;
    })
  );
  addSelection = (option, e) => {
    console.log("selected", option);
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.focus();
    }
    if (this.multiple) {
      this.Value.push(option);
    } else {
      this.Value(option);
    }
  };
  removeSelection = (option) => this.multiple ? this.Value.remove(option) : this.Value(null);
  setInputGroupFocus = () => {
    this.InputGroupFocused(true);
    clearTimeout(this.focusOutTimeout);
  };
  removeInputGroupFocus = (data2, e) => {
    this.focusOutTimeout = window.setTimeout(() => {
      this.InputGroupFocused(false);
    }, 0);
  };
  static editTemplate = editTemplate7;
  static view = "search-select-view";
  static edit = "search-select-edit";
  static new = "search-select-new";
};
registerFieldComponents(SearchSelectModule);

// src/sal/components/fields/SelectModule.js
var editTemplate8 = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <!-- ko if: multiple -->
    <select
      class="form-select"
      multiple="true"
      data-bind="options: Options, 
        optionsCaption: 'Select...', 
        optionsText: optionsText,
        selectedOptions: Value,
        class: ValidationClass,
        enable: Enable"
    ></select>
    <div class="fst-italic fw-light">Hold ctrl to select multiple.</div>
    <!-- /ko -->
    <!-- ko ifnot: multiple -->
    <select
      class="form-select"
      data-bind="options: Options, 
        optionsCaption: 'Select...', 
        optionsText: optionsText,
        value: Value,
        class: ValidationClass,
        enable: Enable"
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
var SelectModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  static editTemplate = editTemplate8;
  static view = "select-view";
  static edit = "select-edit";
  static new = "select-edit";
};
registerFieldComponents(SelectModule);

// src/sal/components/fields/TextAreaModule.js
var editTemplate9 = html`
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
    <div
      class="richtext-field"
      data-bind="childrenComplete: childrenHaveLoaded"
    >
      <!-- Create the editor container -->
      <div
        class="form-control"
        data-bind="attr: {'id': getUniqueId()}, class: ValidationClass"
        style="height: 150px"
      >
        <div data-bind="html: Value"></div>
      </div>
    </div>
    <!-- /ko -->
    <!-- ko ifnot: isRichText -->
    <label class="fw-semibold w-full"
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
    <!-- ko if: ShowErrors -->
    <!-- ko foreach: Errors -->
    <div class="fw-semibold text-danger" data-bind="text: description"></div>
    <!-- /ko -->
    <!-- /ko -->
  </div>
`;
var viewTemplate5 = html`
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
var TextAreaModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  childrenHaveLoaded = (nodes) => {
    this.initializeEditor();
  };
  getToolbarId = () => "toolbar-" + this.getUniqueId();
  initializeEditor() {
    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      // toggled buttons
      ["link"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }],
      // outdent/indent
      [{ direction: "rtl" }],
      // text direction
      [{ size: ["small", false, "large", "huge"] }],
      // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ["clean"]
      // remove formatting button
    ];
    var editor = new Quill("#" + this.getUniqueId(), {
      modules: { toolbar: toolbarOptions },
      theme: "snow"
    });
    const Value = this.Value;
    Value.subscribe((val) => {
      if (val == "") {
        editor.setText("");
        return;
      }
      if (editor.root.innerHTML == val) return;
      editor.root.innerHTML == val;
    });
    editor.on("text-change", function(delta, oldDelta, source) {
      Value(editor.root.textContent ? editor.root.innerHTML : "");
    });
  }
  static viewTemplate = viewTemplate5;
  static editTemplate = editTemplate9;
  static view = "text-area-view";
  static edit = "text-area-edit";
  static new = "text-area-edit";
};
registerFieldComponents(TextAreaModule);

// src/sal/components/fields/TextModule.js
var editTemplate10 = html`
  <label class="fw-semibold"
    ><span data-bind="text: displayName"></span
    ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
    <input
      class="form-control"
      data-bind="textInput: Value, 
        class: ValidationClass, 
        attr: attr, 
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
var TextModule = class extends BaseFieldModule {
  constructor(params) {
    super(params);
  }
  static editTemplate = editTemplate10;
  static view = "text-view";
  static edit = "text-edit";
  static new = "text-edit";
};
registerFieldComponents(TextModule);

// src/sal/fields/CheckboxField.js
var CheckboxField = class extends BaseField {
  constructor(params) {
    super(params);
  }
  components = CheckboxModule;
};

// src/sal/fields/DateField.js
var dateFieldTypes = {
  date: "date",
  datetime: "datetime-local"
};
var DateField = class extends BaseField {
  constructor(params) {
    super(params);
    this.type = params.type ?? dateFieldTypes.date;
  }
  toString = ko.pureComputed(() => {
    switch (this.type) {
      case dateFieldTypes.date:
        return this.toLocaleDateString();
      case dateFieldTypes.datetime:
        return this.toLocaleString();
      default:
        return "";
    }
  });
  toSortableDateString = () => this.Value()?.format("yyyy-MM-dd");
  toLocaleDateString = () => this.Value()?.toLocaleDateString();
  toLocaleString = () => this.Value()?.toLocaleString();
  toInputDateString = () => {
    const d = this.Value();
    return [
      d.getUTCFullYear().toString().padStart(4, "0"),
      (d.getUTCMonth() + 1).toString().padStart(2, "0"),
      d.getUTCDate().toString().padStart(2, "0")
    ].join("-");
  };
  toInputDateTimeString = () => this.Value().format("yyyy-MM-ddThh:mm");
  get = ko.pureComputed(() => {
    if (!this.Value() || isNaN(this.Value().valueOf())) {
      return null;
    }
    return this.Value().toISOString();
  });
  set = (newDate) => {
    if (!newDate) return null;
    if (newDate.constructor.getName() != "Date") {
      newDate = new Date(newDate);
    }
    if (newDate.getTimezoneOffset()) {
    }
    this.Value(newDate);
  };
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
      if (this.type == dateFieldTypes.datetime) {
        this.Value(new Date(val));
        return;
      }
      this.Value(/* @__PURE__ */ new Date(val + "T00:00"));
    }
  });
  components = DateModule;
};

// src/sal/fields/LookupField.js
var LookupField = class extends BaseField {
  constructor({
    displayName,
    type: entityType,
    isRequired = false,
    Visible,
    appContext: appContext2,
    options = ko.observableArray(),
    optionsFilter = null,
    optionsText = null,
    multiple = false,
    lookupCol = null,
    instructions
  }) {
    super({ Visible, displayName, isRequired, instructions });
    if (!options) {
      this.isSearch = true;
    } else {
      this.isSearch = false;
      this.allOpts = options;
    }
    this.isSearch = !options;
    this.multiple = multiple;
    this.Value = multiple ? ko.observableArray() : ko.observable();
    this._appContext = appContext2;
    this.entityType = entityType;
    this.lookupCol = lookupCol ?? "Title";
    this.optionsText = optionsText ?? ((item) => item[this.lookupCol]);
    if (optionsFilter) this.optionsFilter = optionsFilter;
    this.components = multiple ? SearchSelectModule : LookupModule;
  }
  _entitySet;
  get entitySet() {
    if (!this._entitySet) {
      this._entitySet = this._appContext().Set(this.entityType);
    }
    return this._entitySet;
  }
  isSearch = false;
  allOpts;
  optionsFilter = (val) => val;
  Options = ko.pureComputed(() => {
    const optsFilter = ko.unwrap(this.optionsFilter);
    const allOpts = ko.unwrap(this.allOpts);
    return allOpts.filter(optsFilter);
  });
  IsLoading = ko.observable(false);
  HasLoaded = ko.observable(false);
  // TODO: Started this, should really go in the entity base class if we're doing active record
  // create = async () => {
  //   const newItems = this.multiple ? this.Value() : [this.Value()]
  //   newItems.map(item => this.entitySet.AddEntity(newItems))
  // }
  refresh = async () => {
    if (!!!this.Value()) {
      return;
    }
    this.IsLoading(true);
    if (!this.multiple) {
      await this.entitySet.LoadEntity(this.Value());
      this.IsLoading(false);
      this.HasLoaded(true);
      return;
    }
    await Promise.all(
      this.Value().map(
        async (entity) => await this.entitySet.LoadEntity(entity)
      )
    );
    this.IsLoading(false);
    this.HasLoaded(true);
  };
  ensure = async () => {
    if (this.HasLoaded()) return;
    if (this.IsLoading()) {
      return new Promise((resolve, reject2) => {
        const isLoadingSubscription = this.IsLoading.subscribe((isLoading) => {
          if (!isLoading) {
            isLoadingSubscription.dispose();
            resolve();
          }
        });
      });
    }
    await this.refresh();
  };
  toString = ko.pureComputed(() => {
    if (!!!this.Value()) {
      return "";
    }
    if (this.multiple) {
      return this.Value().map((val) => getEntityPropertyAsString(val, this.lookupCol)).join(", ");
    }
    return getEntityPropertyAsString(this.Value(), this.lookupCol);
  });
  get = () => {
    if (!this.Value()) return;
    if (this.multiple) {
      return this.Value().map((entity2) => {
        return {
          ID: entity2.ID,
          LookupValue: entity2.LookupValue,
          Title: entity2.Title
        };
      });
    }
    const entity = this.Value();
    return {
      ID: entity.ID,
      LookupValue: entity.LookupValue,
      Title: entity.Title
    };
  };
  set = (val) => {
    if (!val) {
      this.Value(val);
      return;
    }
    if (this.multiple) {
      const valArr = Array.isArray(val) ? val : val.results ?? val.split("#;");
      this.Value(valArr.map((value) => this.findOrCreateNewEntity(value)));
      return;
    }
    this.Value(this.findOrCreateNewEntity(val));
    if (val && !this.toString()) {
    }
  };
  findOrCreateNewEntity = (val) => {
    if (this.entityType.FindInStore) {
      const foundEntity = this.entityType.FindInStore(val);
      if (foundEntity) return foundEntity;
      console.warn(
        `Could not find entity in store: ${this.entityType.name}`,
        val
      );
    }
    const optionEntity = this.allOpts().find((entity) => entity.ID == val.ID);
    if (optionEntity) return optionEntity;
    if (this.entityType.Create) {
      return this.entityType.Create(val);
    }
    const newEntity = new this.entityType();
    newEntity.ID = val.ID;
    this.entitySet.LoadEntity(newEntity);
    return newEntity;
  };
};
function getEntityPropertyAsString(entity, column) {
  if (entity.FieldMap && entity.FieldMap[column]) {
    const field = entity.FieldMap[column];
    if (typeof field == "function") {
      return field();
    }
    if (field.toString && typeof field.toString == "function") {
      return field.toString();
    }
    if (field.get && typeof field.get == "function") {
      return field.get();
    }
    if (field.obs) {
      return field.obs();
    }
    return field;
  }
  return entity[column] ?? "";
}

// src/sal/infrastructure/sal.js
window.console = window.console || { log: function() {
} };
var sal2 = {};
var serverRelativeUrl = _spPageContextInfo.webServerRelativeUrl == "/" ? "" : _spPageContextInfo.webServerRelativeUrl;
sal2.globalConfig = sal2.globalConfig || {
  siteGroups: [],
  siteUrl: serverRelativeUrl,
  listServices: serverRelativeUrl + "/_vti_bin/ListData.svc/",
  defaultGroups: {}
};
sal2.site = sal2.site || {};
window.DEBUG = true;
function executeQuery(currCtx) {
  return new Promise(
    (resolve, reject2) => currCtx.executeQueryAsync(resolve, (sender, args) => {
      reject2({ sender, args });
    })
  );
}
function principalToPeople(oPrincipal, isGroup = null) {
  const people = {
    ID: oPrincipal.get_id(),
    Title: oPrincipal.get_title(),
    LoginName: oPrincipal.get_loginName(),
    IsEnsured: true,
    IsGroup: isGroup != null ? isGroup : oPrincipal.constructor.getName() == "SP.Group",
    oPrincipal
  };
  if (oPrincipal.get_email) people.Email = oPrincipal.get_email();
  return people;
}
var siteGroups = {};
async function getGroupUsers(groupName) {
  if (siteGroups[groupName]?.Users?.constructor == Array) {
    return siteGroups[groupName].Users;
  }
  const url = `/web/sitegroups/GetByName('${groupName}')?$expand=Users`;
  const groupResult = await fetchSharePointData(url);
  const group = groupResult.d;
  group.Users = group.Users?.results;
  siteGroups[groupName] = group;
  return group.Users;
}
var webRoot = _spPageContextInfo.webAbsoluteUrl == "/" ? "" : _spPageContextInfo.webAbsoluteUrl;
async function InitSal() {
  if (sal2.utilities) return;
  console.log("Init Sal");
  var currCtx = SP.ClientContext.get_current();
  var web = currCtx.get_web();
  sal2.globalConfig.defaultGroups = {
    owners: web.get_associatedOwnerGroup(),
    members: web.get_associatedMemberGroup(),
    visitors: web.get_associatedVisitorGroup()
  };
  currCtx.load(sal2.globalConfig.defaultGroups.owners);
  currCtx.load(sal2.globalConfig.defaultGroups.members);
  currCtx.load(sal2.globalConfig.defaultGroups.visitors);
  var user = web.get_currentUser();
  currCtx.load(user);
  var siteGroupCollection = web.get_siteGroups();
  currCtx.load(siteGroupCollection);
  sal2.globalConfig.roles = [];
  var oRoleDefinitions2 = currCtx.get_web().get_roleDefinitions();
  currCtx.load(oRoleDefinitions2);
  return new Promise((resolve, reject2) => {
    currCtx.executeQueryAsync(
      function() {
        sal2.globalConfig.currentUser = user;
        var listItemEnumerator = siteGroupCollection.getEnumerator();
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();
          sal2.globalConfig.siteGroups.push(principalToPeople(oListItem));
        }
        var oEnumerator = oRoleDefinitions2.getEnumerator();
        while (oEnumerator.moveNext()) {
          var oRoleDefinition2 = oEnumerator.get_current();
          sal2.globalConfig.roles.push(oRoleDefinition2.get_name());
        }
        sal2.config = new sal2.NewAppConfig();
        sal2.utilities = new sal2.NewUtilities();
        resolve();
      },
      function(sender, args) {
        alert("Error initializing SAL");
        reject2();
      }
    );
  });
}
sal2.NewAppConfig = function() {
  var siteRoles = {};
  siteRoles.roles = {
    FullControl: "Full Control",
    Design: "Design",
    Edit: "Edit",
    Contribute: "Contribute",
    RestrictedContribute: "Restricted Contribute",
    InitialCreate: "Initial Create",
    Read: "Read",
    RestrictedRead: "Restricted Read",
    LimitedAccess: "Limited Access"
  };
  siteRoles.fulfillsRole = function(inputRole, targetRole) {
    const roles = Object.values(siteRoles.roles);
    if (!roles.includes(inputRole) || !roles.includes(targetRole)) return false;
    return roles.indexOf(inputRole) <= roles.indexOf(targetRole);
  };
  siteRoles.validate = function() {
    Object.keys(siteRoles.roles).forEach(function(role) {
      var roleName = siteRoles.roles[role];
      if (!sal2.globalConfig.roles.includes(roleName)) {
        console.error(roleName + " is not in the global roles list");
      } else {
        console.log(roleName);
      }
    });
  };
  var siteGroups2 = {
    groups: {
      Owners: "workorder Owners",
      Members: "workorder Members",
      Visitors: "workorder Visitors",
      RestrictedReaders: "Restricted Readers"
    }
  };
  var publicMembers = {
    siteRoles,
    siteGroups: siteGroups2
  };
  return publicMembers;
};
async function getUserPropsAsync(userId = _spPageContextInfo.userId) {
  const userPropsUrl = `/sp.userprofiles.peoplemanager/getmyproperties`;
  const userInfoUrl = `/Web/GetUserById(${userId})/?$expand=Groups`;
  const userInfo = (await fetchSharePointData(userInfoUrl)).d;
  const userProps = (await fetchSharePointData(userPropsUrl))?.d.UserProfileProperties.results;
  function findPropValue(props, key) {
    return props.find((prop) => prop.Key == key)?.Value;
  }
  return {
    ID: userId,
    Title: userInfo.Title,
    LoginName: userInfo.LoginName,
    WorkPhone: findPropValue(userProps, "WorkPhone"),
    EMail: findPropValue(userProps, "WorkEmail"),
    // TODO: Do we still need this spelling?
    IsEnsured: true,
    IsGroup: false,
    Groups: userInfo.Groups?.results?.map((group) => {
      return {
        ...group,
        ID: group.Id,
        IsGroup: true,
        IsEnsured: true
      };
    })
  };
}
sal2.NewUtilities = function() {
  function createSiteGroup(groupName, permissions, callback) {
    callback = callback === void 0 ? null : callback;
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var groupCreationInfo = new SP.GroupCreationInformation();
    groupCreationInfo.set_title(groupName);
    this.oGroup = oWebsite.get_siteGroups().add(groupCreationInfo);
    oGroup.set_owner(oWebsite.get_associatedOwnerGroup());
    oGroup.update();
    var collRoleDefinitionBinding = SP.RoleDefinitionBindingCollection.newObject(clientContext);
    this.oRoleDefinitions = [];
    permissions.forEach(function(perm) {
      var oRoleDefinition2 = oWebsite.get_roleDefinitions().getByName(perm);
      this.oRoleDefinitions.push(oRoleDefinition2);
      collRoleDefinitionBinding.add(oRoleDefinition2);
    });
    var collRollAssignment = oWebsite.get_roleAssignments();
    collRollAssignment.add(oGroup, collRoleDefinitionBinding);
    function onCreateGroupSucceeded() {
      var roleInfo = oGroup.get_title() + " created and assigned to " + oRoleDefinitions.forEach(function(rd) {
        rd + ", ";
      });
      if (callback) {
        callback(oGroup.get_id());
      }
      console.log(roleInfo);
    }
    function onCreateGroupFailed(sender, args) {
      alert(
        groupnName + " - Create group failed. " + args.get_message() + "\n" + args.get_stackTrace()
      );
    }
    clientContext.load(oGroup, "Title");
    var data2 = {
      groupName,
      oGroup,
      oRoleDefinition,
      callback
    };
    clientContext.executeQueryAsync(
      Function.createDelegate(data2, onCreateGroupSucceeded),
      Function.createDelegate(data2, onCreateGroupFailed)
    );
  }
  function getUserGroups(user, callback) {
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var everyone = web.ensureUser(user);
    var oGroups = everyone.get_groups();
    function onQueryGroupsSucceeded() {
      var groups = new Array();
      var groupsInfo = new String();
      var groupsEnumerator = oGroups.getEnumerator();
      while (groupsEnumerator.moveNext()) {
        var oGroup2 = groupsEnumerator.get_current();
        var group = principalToPeople(oGroup2);
        groupsInfo += "\nGroup ID: " + oGroup2.get_id() + ", Title : " + oGroup2.get_title();
        groups.push(group);
      }
      console.log(groupsInfo.toString());
      callback(groups);
    }
    function onQueryGroupsFailed(sender, args) {
      console.error(
        " Everyone - Query Everyone group failed. " + args.get_message() + "\n" + args.get_stackTrace()
      );
    }
    currCtx.load(everyone);
    currCtx.load(oGroups);
    data = { everyone, oGroups, callback };
    currCtx.executeQueryAsync(
      Function.createDelegate(data, onQueryGroupsSucceeded),
      Function.createDelegate(data, onQueryGroupsFailed)
    );
  }
  function getUsersWithGroup(oGroup2, callback) {
    var context = new SP.ClientContext.get_current();
    var oUsers = oGroup2.get_users();
    function onGetUserSuccess() {
      var userObjs = [];
      var userEnumerator = oUsers.getEnumerator();
      while (userEnumerator.moveNext()) {
        var oUser = userEnumerator.get_current();
        var userObj = principalToPeople(oUser);
        userObjs.push(userObj);
      }
      callback(userObjs);
    }
    function onGetUserFailed(sender, args) {
    }
    var data2 = { oUsers, callback };
    context.load(oUsers);
    context.executeQueryAsync(
      Function.createDelegate(data2, onGetUserSuccess),
      Function.createDelegate(data2, onGetUserFailed)
    );
  }
  function copyFiles(sourceLib, destLib, callback, onError) {
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    var folderSrc = web.getFolderByServerRelativeUrl(sourceLib);
    context.load(folderSrc, "Files");
    context.executeQueryAsync(
      function() {
        console.log("Got the source folder right here!");
        var files = folderSrc.get_files();
        var e = files.getEnumerator();
        var dest = [];
        while (e.moveNext()) {
          var file = e.get_current();
          var destLibUrl = destLib + "/" + file.get_name();
          dest.push(destLibUrl);
          file.copyTo(destLibUrl, true);
        }
        console.log(dest);
        context.executeQueryAsync(
          function() {
            console.log("Files moved successfully!");
            callback();
          },
          function(sender, args) {
            console.log("error: ") + args.get_message();
            onError;
          }
        );
      },
      function(sender, args) {
        console.log("Sorry, something messed up: " + args.get_message());
      }
    );
  }
  function copyFilesAsync(sourceFolder, destFolder) {
    return new Promise((resolve, reject2) => {
      copyFiles(sourceFolder, destFolder, resolve, reject2);
    });
  }
  var publicMembers = {
    copyFiles,
    copyFilesAsync,
    createSiteGroup,
    getUserGroups,
    getUsersWithGroup
  };
  return publicMembers;
};
async function copyFileAsync(sourceFilePath, destFilePath) {
  const uri = `/web/getfilebyserverrelativeurl('${sourceFilePath}')/copyto('${destFilePath}')`;
  const result = await fetchSharePointData(uri, "POST");
  return result;
}
async function ensurePerson(person) {
  const uri = `/web/getuserbyid(${person.ID})`;
  const user = await fetchSharePointData(uri);
  if (!user) return;
  Object.assign(person, user.d);
  return person;
}
async function ensureUserByKeyAsync(userName) {
  return new Promise((resolve, reject2) => {
    var group = sal2.globalConfig.siteGroups.find(function(group2) {
      return group2.LoginName == userName;
    });
    if (group) {
      resolve(group);
      return;
    }
    var context = new SP.ClientContext.get_current();
    var oUser = context.get_web().ensureUser(userName);
    function onEnsureUserSucceeded(sender, args) {
      const user = principalToPeople(oUser);
      resolve(user);
    }
    function onEnsureUserFailed(sender, args) {
      console.error(
        "Failed to ensure user :" + args.get_message() + "\n" + args.get_stackTrace()
      );
      reject2(args);
    }
    const data2 = { oUser, resolve, reject: reject2 };
    context.load(oUser);
    context.executeQueryAsync(
      Function.createDelegate(data2, onEnsureUserSucceeded),
      Function.createDelegate(data2, onEnsureUserFailed)
    );
  });
}
function getSPSiteGroupByName(groupName) {
  var userGroup = null;
  if (this.globalConfig.siteGroups != null) {
    userGroup = this.globalConfig.siteGroups.find(function(group) {
      return group.Title == groupName;
    });
  }
  return userGroup;
}
var ItemPermissions = class _ItemPermissions {
  constructor({ hasUniqueRoleAssignments, roles }) {
    this.hasUniqueRoleAssignments = hasUniqueRoleAssignments;
    this.roles = roles;
  }
  hasUniqueRoleAssignments;
  roles = [];
  addPrincipalRole(principal, roleName) {
    const newRoleDef = new RoleDef({ name: roleName });
    const principalRole = this.getPrincipalRole(principal);
    if (principalRole) {
      principalRole.addRoleDef(newRoleDef);
      return;
    }
    const newRole = new Role({ principal });
    newRole.addRoleDef(newRoleDef);
    this.roles.push(newRole);
  }
  getPrincipalRole(principal) {
    return this.roles.find((role) => role.principal.ID == principal.ID);
  }
  principalHasPermissionKind(principal, permission) {
    const role = this.getPrincipalRole(principal);
    return role?.roleDefs.find(
      (roleDef) => roleDef.basePermissions?.has(permission)
    ) ? true : false;
  }
  getValuePairs() {
    return this.roles.flatMap(
      (role) => role.roleDefs.map((roleDef) => [role.principal.Title, roleDef.name])
    );
  }
  static fromRestResult(result) {
    const roles = result.RoleAssignments.results.map(
      Role.fromRestRoleAssignment
    );
    return new _ItemPermissions({
      hasUniqueRoleAssignments: result.HasUniqueRoleAssignments,
      roles
    });
  }
};
var Role = class _Role {
  constructor({ principal, roleDefs = [] }) {
    this.principal = principal;
    this.roleDefs = roleDefs;
  }
  principal;
  // People Entity
  roleDefs = [];
  addRoleDef(roleDef) {
    this.roleDefs.push(roleDef);
  }
  static fromRestRoleAssignment(role) {
    return new _Role({
      principal: { ...role.Member, ID: role.Member.Id },
      roleDefs: role.RoleDefinitionBindings.results.map(
        RoleDef.fromRestRoleDef
      )
    });
  }
  static fromJsomRole(role) {
    const newRole = new _Role({
      principal: principalToPeople(role.get_member())
    });
    var roleDefs = role.get_roleDefinitionBindings();
    if (roleDefs != null) {
      var roleDefsEnumerator = roleDefs.getEnumerator();
      while (roleDefsEnumerator.moveNext()) {
        var roleDef = roleDefsEnumerator.get_current();
        newRole.roleDefs.push(RoleDef.fromJsomRoleDef(roleDef));
      }
    }
    return newRole;
  }
};
var RoleDef = class _RoleDef {
  constructor({ name, basePermissions = null }) {
    this.name = name;
    this.basePermissions = basePermissions;
  }
  name;
  basePermissions;
  static fromRestRoleDef(roleDef) {
    const newRoleDef = new _RoleDef({
      name: roleDef.Name,
      basePermissions: roleDef.BasePermissions
    });
    Object.assign(newRoleDef, roleDef);
    return newRoleDef;
  }
  static fromJsomRoleDef(roleDef) {
    const newRoleDef = new _RoleDef({ name: roleDef.get_name() });
    newRoleDef.basePermissions = roleDef.get_basePermissions();
    return newRoleDef;
  }
};
function SPList(listDef) {
  var self = this;
  self.config = {
    def: listDef
  };
  async function init() {
    if (!self.config.fieldSchema) {
      const listEndpoint = `/web/lists/GetByTitle('${self.config.def.title}')?$expand=Fields`;
      const list = await fetchSharePointData(listEndpoint);
      self.config.guid = list.d.Id;
      self.config.fieldSchema = list.d.Fields.results;
    }
  }
  init();
  async function setListPermissionsAsync(itemPermissions, reset) {
    const currCtx = new SP.ClientContext.get_current();
    const web = currCtx.get_web();
    const oList = web.get_lists().getByTitle(self.config.def.title);
    return setResourcePermissionsAsync(oList, itemPermissions, reset);
  }
  function setListPermissions(valuePairs, callback, reset) {
    reset = reset === void 0 ? false : reset;
    var users = new Array();
    var resolvedGroups = new Array();
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var oList = web.get_lists().getByTitle(self.config.def.title);
    valuePairs.forEach(function(vp) {
      var resolvedGroup = getSPSiteGroupByName(vp[0]);
      if (resolvedGroup) {
        resolvedGroups.push([resolvedGroup, vp[1]]);
      } else {
        users.push([currCtx.get_web().ensureUser(vp[0]), vp[1]]);
      }
    });
    function onFindItemSucceeded() {
      console.log("Successfully found item");
      var currCtx2 = new SP.ClientContext.get_current();
      var web2 = currCtx2.get_web();
      if (reset) {
        oList.resetRoleInheritance();
        oList.breakRoleInheritance(false, false);
        oList.get_roleAssignments().getByPrincipal(sal2.globalConfig.currentUser).deleteObject();
      } else {
        oList.breakRoleInheritance(false, false);
      }
      this.resolvedGroups.forEach(function(groupPairs) {
        var roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currCtx2);
        roleDefBindingColl.add(
          web2.get_roleDefinitions().getByName(groupPairs[1])
        );
        oList.get_roleAssignments().add(groupPairs[0], roleDefBindingColl);
      });
      this.users.forEach(function(userPairs) {
        var roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currCtx2);
        roleDefBindingColl.add(
          web2.get_roleDefinitions().getByName(userPairs[1])
        );
        oList.get_roleAssignments().add(userPairs[0], roleDefBindingColl);
      });
      var data3 = { oList, callback };
      function onSetListPermissionsSuccess() {
        console.log("Successfully set permissions");
        callback(oList);
      }
      function onSetListPermissionsFailure(sender, args) {
        console.error(
          "Failed to update permissions on List: " + this.oList.get_title() + args.get_message() + "\n",
          args.get_stackTrace()
        );
      }
      currCtx2.load(oList);
      currCtx2.executeQueryAsync(
        Function.createDelegate(data3, onSetListPermissionsSuccess),
        Function.createDelegate(data3, onSetListPermissionsFailure)
      );
    }
    function onFindItemFailed(sender, args) {
      console.error(
        "Failed to find List: " + this.oList.get_title + args.get_message(),
        args.get_stackTrace()
      );
    }
    var data2 = {
      oList,
      users,
      resolvedGroups,
      callback
    };
    currCtx.load(oList);
    users.map(function(user) {
      currCtx.load(user[0]);
    });
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onFindItemSucceeded),
      Function.createDelegate(data2, onFindItemFailed)
    );
  }
  function mapObjectToListItem(val) {
    if (!val) {
      return val;
    }
    if (!Array.isArray(val)) {
      return mapItemToListItem(val);
    }
    return val.map((item) => {
      return mapItemToListItem(item);
    }).join(";#");
  }
  function mapItemToListItem(item) {
    if (item.ID) {
      return `${item.ID};#${item.LookupValue ?? ""}`;
    }
    if (item.LookupValue) {
      return item.LookupValue;
    }
    if (item.constructor.getName() == "Date") {
      return item.toISOString();
    }
    return item;
  }
  async function createListItemAsync(entity, folderPath = null) {
    let serverRelFolderPath;
    if (folderPath) {
      serverRelFolderPath = getServerRelativeFolderPath(folderPath);
    }
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      const itemCreateInfo = new SP.ListItemCreationInformation();
      if (folderPath) {
        itemCreateInfo.set_folderUrl(serverRelFolderPath);
      }
      const oListItem = oList.addItem(itemCreateInfo);
      const restrictedFields = [
        "ID",
        "Author",
        "Created",
        "Editor",
        "Modified"
      ];
      Object.keys(entity).filter((key) => !restrictedFields.includes(key)).forEach((key) => {
        oListItem.set_item(key, mapObjectToListItem(entity[key]));
      });
      oListItem.update();
      function onCreateListItemSucceeded() {
        resolve(oListItem.get_id());
      }
      function onCreateListItemFailed(sender, args) {
        console.error("Create Item Failed - List: " + self.config.def.name);
        console.error("ValuePairs", entity);
        console.error(sender, args);
        reject2(sender);
      }
      const data2 = { entity, oListItem, resolve, reject: reject2 };
      currCtx.load(oListItem);
      currCtx.executeQueryAsync(
        Function.createDelegate(data2, onCreateListItemSucceeded),
        Function.createDelegate(data2, onCreateListItemFailed)
      );
    });
  }
  function mapListItemToObject(val) {
    if (!val) {
      return val;
    }
    let out = {};
    switch (val.constructor.getName()) {
      case "SP.FieldUserValue":
        out.LoginName = val.get_email();
      case "SP.FieldLookupValue":
        out.ID = val.get_lookupId();
        out.LookupValue = val.get_lookupValue();
        out.Title = val.get_lookupValue();
        break;
      default:
        out = val;
    }
    return out;
  }
  function getListItems(caml, fields, callback) {
    var camlQuery = new SP.CamlQuery.createAllItemsQuery();
    camlQuery.set_viewXml(caml);
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var oList = web.get_lists().getByTitle(self.config.def.title);
    var collListItem = oList.getItems(camlQuery);
    function onGetListItemsSucceeded() {
      var self2 = this;
      var listItemEnumerator = self2.collListItem.getEnumerator();
      const foundObjects = [];
      while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var listObj = {};
        fields.forEach((field) => {
          var colVal = oListItem.get_item(field);
          listObj[field] = Array.isArray(colVal) ? colVal.map((val) => mapListItemToObject(val)) : mapListItemToObject(colVal);
        });
        foundObjects.push(listObj);
      }
      callback(foundObjects);
    }
    function onGetListItemsFailed(sender, args) {
      console.log("unsuccessful read", sender);
      alert(
        "Request on list " + self.config.def.name + " failed, producing the following error: \n " + args.get_message() + "\nStackTrack: \n " + args.get_stackTrace()
      );
    }
    var data2 = {
      collListItem,
      callback,
      fields,
      camlQuery
    };
    currCtx.load(collListItem, `Include(${fields.join(", ")})`);
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onGetListItemsSucceeded),
      Function.createDelegate(data2, onGetListItemsFailed)
    );
  }
  function getListItemsAsync({ fields = null, caml = null }) {
    if (!caml) {
      var caml = '<View Scope="RecursiveAll"><Query><Where><Eq><FieldRef Name="FSObjType"/><Value Type="int">0</Value></Eq></Where></Query></View>';
    }
    return new Promise((resolve, reject2) => {
      getListItems(caml, fields, resolve);
    });
  }
  function findByIdAsync(id2, fields) {
    return new Promise((resolve, reject2) => {
      try {
        findById(id2, fields, resolve);
      } catch (e) {
        reject2(e);
      }
    });
  }
  async function getById(id2, fields) {
    const [queryFields, expandFields] = await getQueryFields(fields);
    const apiEndpoint = `/web/lists/GetByTitle('${self.config.def.title}')/items(${id2})?$Select=${queryFields}&$expand=${expandFields}`;
    const result = await fetchSharePointData(apiEndpoint);
    return result.d;
  }
  async function getListFields() {
    if (!self.config.fieldSchema) {
      const apiEndpoint = `/web/lists/GetByTitle('${self.config.def.title}')/Fields`;
      const fields = await fetchSharePointData(apiEndpoint);
      self.config.fieldSchema = fields.d.results;
    }
    return self.config.fieldSchema;
  }
  async function getQueryFields(fields) {
    const queryFields = [];
    const expandFields = [];
    const listFields = await getListFields();
    fields.map((f) => {
      if (f == "FileRef") {
        queryFields.push(f);
        return;
      }
      if (f.includes("/")) {
        queryFields.push(f);
        expandFields.push(f.split("/")[0]);
        return;
      }
      const fieldSchema = listFields.find((lf) => lf.StaticName == f);
      if (!fieldSchema) {
        alert(`Field '${f}' not found on list ${self.config.def.name}`);
        return;
      }
      const idString = f + "/ID";
      let titleString = f + "/Title";
      switch (fieldSchema.TypeAsString) {
        case "LookupMulti":
        case "Lookup":
          titleString = f + "/" + fieldSchema.LookupField;
        case "User":
          queryFields.push(idString);
          queryFields.push(titleString);
          expandFields.push(f);
          break;
        case "Choice":
        default:
          queryFields.push(f);
      }
    });
    return [queryFields, expandFields];
  }
  async function findByColumnValueAsync(columnFilters, { orderByColumn = null, sortAsc }, { count = null, includePermissions = false, includeFolders = false }, fields) {
    const [queryFields, expandFields] = await getQueryFields(fields);
    if (includePermissions) {
      queryFields.push("RoleAssignments");
      queryFields.push("HasUniqueRoleAssignments");
      expandFields.push("RoleAssignments");
    }
    const orderBy = orderByColumn ? `$orderby=${orderByColumn} ${sortAsc ? "asc" : "desc"}` : "";
    const colFilterArr = columnFilters.map((colFilter) => {
      if (typeof colFilter == "string") return colFilter;
      const value = colFilter.value ? `'${colFilter.value}'` : colFilter.value;
      return `(${colFilter.column} ${colFilter.op ?? "eq"} ${value})`;
    });
    if (!includeFolders) colFilterArr.push(`FSObjType eq '0'`);
    const filter = "$filter=" + colFilterArr.join(` and `);
    const include = "$select=" + queryFields;
    const expand = `$expand=` + expandFields;
    const page = count ? `$top=${count}` : "";
    const apiEndpoint = `/web/lists/GetByTitle('${self.config.def.title}')/items?${include}&${expand}&${orderBy}&${filter}&${page}`;
    const result = await fetchSharePointData(apiEndpoint);
    const cursor = {
      results: result?.d?.results,
      _next: result?.d?.__next
    };
    return cursor;
  }
  async function loadNextPage(cursor) {
    const result = await fetchSharePointData(cursor._next);
    return {
      results: result?.d?.results,
      _next: result?.d?.__next
    };
  }
  function findById(id2, fields, callback) {
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var oList = web.get_lists().getByTitle(self.config.def.title);
    var oListItem = oList.getItemById(id2);
    function onGetListItemSucceeded() {
      const listObj = {};
      fields.forEach((field) => {
        var colVal = oListItem.get_item(field);
        listObj[field] = Array.isArray(colVal) ? colVal.map((val) => mapListItemToObject(val)) : mapListItemToObject(colVal);
      });
      callback(listObj);
    }
    function onGetListItemFailed(sender, args) {
      console.error("SAL: findById - List: " + self.config.def.name);
      console.error("Fields", this);
      console.error(sender, args);
    }
    var data2 = {
      oListItem,
      callback,
      fields
    };
    currCtx.load(oListItem);
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onGetListItemSucceeded),
      Function.createDelegate(data2, onGetListItemFailed)
    );
  }
  function updateListItemAsync(entity) {
    if (!entity?.ID) {
      return false;
    }
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      const oListItem = oList.getItemById(entity.ID);
      const restrictedFields = [
        "ID",
        "Author",
        "Created",
        "Editor",
        "Modified"
      ];
      Object.keys(entity).filter((key) => !restrictedFields.includes(key)).forEach((key) => {
        oListItem.set_item(key, mapObjectToListItem(entity[key]));
      });
      oListItem.update();
      function onUpdateListItemsSucceeded() {
        console.log("Successfully updated " + this.oListItem.get_item("Title"));
        resolve();
      }
      function onUpdateListItemFailed(sender, args) {
        console.error("Update Failed - List: " + self.config.def.name);
        console.error("Item Id", this.oListItem.get_id() ?? "N/A");
        console.error(entity);
        console.error(sender, args);
        reject2(args);
      }
      const data2 = { oListItem, entity, resolve, reject: reject2 };
      currCtx.load(oListItem);
      currCtx.executeQueryAsync(
        Function.createDelegate(data2, onUpdateListItemsSucceeded),
        Function.createDelegate(data2, onUpdateListItemFailed)
      );
    });
  }
  function deleteListItem(id2, callback) {
    var currCtx = new SP.ClientContext.get_current();
    var web = currCtx.get_web();
    var oList = web.get_lists().getByTitle(self.config.def.title);
    var data2 = { callback };
    const oListItem = oList.getItemById(id2);
    oListItem.deleteObject();
    function onDeleteListItemsSucceeded(sender, args) {
      callback();
    }
    function onDeleteListItemsFailed(sender, args) {
      console.error(
        "sal.SPList.deleteListItem: Request on list " + self.config.def.name + " failed, producing the following error: \n " + args.get_message() + "\nStackTrack: \n " + args.get_stackTrace()
      );
    }
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onDeleteListItemsSucceeded),
      Function.createDelegate(data2, onDeleteListItemsFailed)
    );
  }
  async function deleteListItemAsync(id2) {
    const apiEndpoint = `/web/lists/GetByTitle('${self.config.def.title}')/items(${id2})`;
    return await fetchSharePointData(apiEndpoint, "DELETE", {
      "If-Match": "*"
    });
  }
  async function setItemPermissionsAsync(id2, itemPermissions, reset) {
    const currCtx = new SP.ClientContext.get_current();
    const web = currCtx.get_web();
    const oListItem = await getoListItemByIdAsync(id2);
    return setResourcePermissionsAsync(oListItem, itemPermissions, reset);
  }
  async function setResourcePermissionsAsync(oListItem, itemPermissions, reset) {
    if (reset) {
      oListItem.resetRoleInheritance();
      oListItem.breakRoleInheritance(false, false);
    }
    for (const role of itemPermissions.roles) {
      const ensuredPrincipalResult = await ensureUserByKeyAsync(
        role.principal.Title
      );
      if (!ensuredPrincipalResult) return;
      const currCtx2 = new SP.ClientContext.get_current();
      const web = currCtx2.get_web();
      const oPrincipal = ensuredPrincipalResult.oPrincipal;
      currCtx2.load(oPrincipal);
      role.roleDefs.map((roleDef) => {
        const roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currCtx2);
        roleDefBindingColl.add(
          web.get_roleDefinitions().getByName(roleDef.name)
        );
        oListItem.get_roleAssignments().add(oPrincipal, roleDefBindingColl);
      });
      const data2 = {};
      await executeQuery(currCtx2).catch(({ sender, args }) => {
        console.error(
          `Failed to set role permissions on item id ${id} for principal ${role.principal.Title} ` + args.get_message(),
          args
        );
      });
    }
    if (reset) {
      const currCtx = new SP.ClientContext.get_current();
      oListItem.get_roleAssignments().getByPrincipal(sal2.globalConfig.currentUser).deleteObject();
      await executeQuery(currCtx).catch(({ sender, args }) => {
        console.error(
          `Failed to remove role permissions on item id ${id} for Current User ` + args.get_message(),
          args
        );
      });
    }
  }
  function getoListItemByIdAsync(id2) {
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      const oListItem = oList.getItemById(id2);
      currCtx.executeQueryAsync(
        () => {
          resolve(oListItem);
        },
        (sender, args) => {
          console.error(
            "Failed to find item: " + id2 + args.get_message(),
            args
          );
          reject2();
        }
      );
    });
  }
  function getItemPermissionsAsync(id2) {
    return new Promise((resolve, reject2) => {
      var currCtx = new SP.ClientContext.get_current();
      var web = currCtx.get_web();
      var oList = web.get_lists().getByTitle(self.config.def.title);
      var camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(
        '<View><Query><Where><Eq><FieldRef Name="ID"/><Value Type="Text">' + id2 + "</Value></Eq></Where></Query></View>"
      );
      var oListItems = oList.getItems(camlQuery);
      currCtx.load(
        oListItems,
        "Include(ID, HasUniqueRoleAssignments, RoleAssignments, RoleAssignments.Include(Member, RoleDefinitionBindings))"
      );
      function onQuerySuccess() {
        var listItemEnumerator = oListItems.getEnumerator();
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();
          var itemPermissions = new ItemPermissions({
            hasUniqueRoleAssignments: oListItem.get_hasUniqueRoleAssignments(),
            roles: []
          });
          var roleEnumerator = oListItem.get_roleAssignments().getEnumerator();
          while (roleEnumerator.moveNext()) {
            var roleColl = roleEnumerator.get_current();
            const role = Role.fromJsomRole(roleColl);
            itemPermissions.roles.push(role);
          }
          resolve(itemPermissions);
          break;
        }
      }
      function onQueryFailed(sender, args) {
        reject2(args.get_message());
      }
      const data2 = {
        oListItems,
        resolve,
        reject: reject2
      };
      currCtx.executeQueryAsync(
        Function.createDelegate(data2, onQuerySuccess),
        Function.createDelegate(data2, onQueryFailed)
      );
    });
  }
  async function getListPermissions() {
    const url = `/web/lists/getByTitle('${self.config.def.name}')?$select=HasUniqueRoleAssignments,RoleAssignments&$expand=RoleAssignments/Member,RoleAssignments/RoleDefinitionBindings`;
    const headers = {
      "Cache-Control": "no-cache"
    };
    const result = await fetchSharePointData(url, "GET", headers);
    if (!result) return;
    return ItemPermissions.fromRestResult(result.d);
  }
  function getServerRelativeFolderPath(relFolderPath) {
    let builtPath = sal2.globalConfig.siteUrl;
    builtPath += self.config.def.isLib ? "/" + self.config.def.name : "/Lists/" + self.config.def.name;
    if (relFolderPath) {
      builtPath += "/" + relFolderPath;
    }
    return builtPath;
  }
  function upsertFolderPathAsync(folderPath) {
    if (self.config.def.isLib) {
      return new Promise(
        (resolve, reject2) => upsertLibFolderByPath(folderPath, resolve)
      );
    }
    return new Promise(
      (resolve, reject2) => upsertListFolderByPath(folderPath, resolve)
    );
  }
  async function setFolderReadonlyAsync(folderPath) {
    try {
      const currentPerms = await getFolderPermissionsAsync(folderPath);
      const targetPerms = currentPerms.map((user) => {
        return [user.LoginName, sal2.config.siteRoles.roles.RestrictedRead];
      });
      await setFolderPermissionsAsync(folderPath, targetPerms, true);
    } catch (e) {
      console.warn(e);
    }
    return;
  }
  async function ensureFolderPermissionsAsync(relFolderPath, targetPerms) {
    const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
    const apiEndpoint = sal2.globalConfig.siteUrl + `/_api/web/GetFolderByServerRelativeUrl('${serverRelFolderPath}')/ListItemAllFields/RoleAssignments?$expand=Member,Member/Users,RoleDefinitionBindings`;
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json; odata=verbose"
      }
    });
    if (!response.ok) {
      if (response.status == 404) {
        return;
      }
      console.error(response);
    }
    const result = await response.json();
    const permissionResults = result?.d?.results;
    if (!permissionResults) {
      console.warn("No results found", result);
      return;
    }
    const missingPerms = targetPerms.filter((targetPermPair) => {
      const targetLoginName = targetPermPair[0];
      const targetPerm = targetPermPair[1];
      const permExists = permissionResults.find((curPerm) => {
        if (curPerm.Member.LoginName != targetLoginName) {
          if (!curPerm.Member.Users?.results.find(
            (curUser) => curUser.LoginName == targetLoginName
          )) {
            return false;
          }
        }
        if (curPerm.RoleDefinitionBindings.results?.find(
          (curBinding) => sal2.config.siteRoles.fulfillsRole(curBinding.Name, targetPerm)
        )) {
          return true;
        }
        return false;
      });
      return !permExists;
    });
    console.log("Adding missing permissions", missingPerms);
    if (missingPerms.length)
      await setFolderPermissionsAsync(relFolderPath, missingPerms, false);
    return;
  }
  function getFolderContentsAsync(relFolderPath, fields) {
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
      const camlQuery = SP.CamlQuery.createAllItemsQuery();
      camlQuery.set_folderServerRelativeUrl(serverRelFolderPath);
      const allItems = oList.getItems(camlQuery);
      currCtx.load(allItems, `Include(${fields.join(", ")})`);
      currCtx.executeQueryAsync(
        function() {
          const foundObjects = [];
          var listItemEnumerator = allItems.getEnumerator();
          while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();
            var listObj = {};
            fields.forEach((field) => {
              var colVal = oListItem.get_item(field);
              listObj[field] = Array.isArray(colVal) ? colVal.map((val) => mapListItemToObject(val)) : mapListItemToObject(colVal);
            });
            listObj.oListItem = oListItem;
            foundObjects.push(listObj);
          }
          resolve(foundObjects);
        },
        function(sender, args) {
          console.warn("Unable load list folder contents:");
          console.error(sender);
          console.error(args);
          reject2(args);
        }
      );
    });
  }
  async function getFolderPermissionsAsync(relFolderPath) {
    return new Promise(async (resolve, reject2) => {
      const oListItem = await getFolderItemByPath(relFolderPath);
      if (!oListItem) {
        reject2("Folder item does not exist");
        return;
      }
      const roles = oListItem.get_roleAssignments();
      const currCtx = new SP.ClientContext.get_current();
      currCtx.load(oListItem);
      currCtx.load(roles);
      currCtx.executeQueryAsync(
        function() {
          const currCtx2 = new SP.ClientContext.get_current();
          console.log(oListItem);
          const principals = [];
          const bindings = [];
          const roleEnumerator = roles.getEnumerator();
          while (roleEnumerator.moveNext()) {
            const role = roleEnumerator.get_current();
            const principal = role.get_member();
            const bindings2 = role.get_roleDefinitionBindings();
            currCtx2.load(bindings2);
            currCtx2.load(principal);
            principals.push({ principal, bindings: bindings2 });
          }
          currCtx2.executeQueryAsync(
            // success
            function(sender, args) {
              const logins = principals.map(function({ principal, bindings: bindings2 }) {
                const principalRoles = [];
                const bindingEnumerator = bindings2.getEnumerator();
                while (bindingEnumerator.moveNext()) {
                  const binding = bindingEnumerator.get_current();
                  principalRoles.push(binding.get_name());
                }
                return {
                  ID: principal.get_id(),
                  Title: principal.get_title(),
                  LoginName: principal.get_loginName(),
                  Roles: principalRoles
                };
              });
              resolve(logins);
            },
            // failure
            function(sender, args) {
              console.warn("Unable load folder principals permissions:");
              console.error(sender);
              console.error(args);
              reject2(args);
            }
          );
        },
        function(sender, args) {
          console.warn("Unable load folder permissions:");
          console.error(sender);
          console.error(args);
          reject2(args);
        }
      );
    });
  }
  async function getFolderItemByPath(relFolderPath) {
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      const camlQuery = SP.CamlQuery.createAllItemsQuery();
      const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
      var camlq = '<View Scope="RecursiveAll"><Query><Where><And><Eq><FieldRef Name="FSObjType"/><Value Type="int">1</Value></Eq><Eq><FieldRef Name="FileRef"/><Value Type="Text">' + serverRelFolderPath + "</Value></Eq></And></Where></Query><RowLimit>1</RowLimit></View>";
      camlQuery.set_viewXml(camlq);
      const allFolders = oList.getItems(camlQuery);
      async function onFindItemSucceeded() {
        const foundObjects = [];
        var listItemEnumerator = allFolders.getEnumerator();
        while (listItemEnumerator.moveNext()) {
          const oListItem2 = listItemEnumerator.get_current();
          foundObjects.push(oListItem2);
        }
        if (!foundObjects) {
          console.warn("folder not found");
          resolve(foundObjects);
        }
        if (foundObjects.length > 1) {
          console.warn("Multiple folders found!");
          resolve(foundObjects);
        }
        const oListItem = foundObjects[0];
        resolve(oListItem);
      }
      function onFindItemFailed(sender, args) {
        console.warn("Unable load list folder contents:");
        console.error(sender);
        console.error(args);
        reject2(args);
      }
      const data2 = {
        allFolders,
        resolve,
        reject: reject2
      };
      currCtx.load(allFolders);
      currCtx.executeQueryAsync(
        Function.createDelegate(data2, onFindItemSucceeded),
        Function.createDelegate(data2, onFindItemFailed)
      );
    });
  }
  function upsertListFolderByPath(folderPath, callback) {
    var folderArr = folderPath.split("/");
    var idx = 0;
    var upsertListFolderInner = function(parentPath, folderArr2, idx2, success) {
      var folderName = folderArr2[idx2];
      idx2++;
      var curPath = folderArr2.slice(0, idx2).join("/");
      ensureListFolder(
        curPath,
        function(iFolder) {
          if (idx2 >= folderArr2.length) {
            success(iFolder.get_id());
          } else {
            upsertListFolderInner(curPath, folderArr2, idx2, success);
          }
        },
        function() {
          self.createListFolder(
            folderName,
            function(folderId) {
              if (idx2 >= folderArr2.length) {
                success(folderId);
              } else {
                upsertListFolderInner(curPath, folderArr2, idx2, success);
              }
            },
            parentPath
          );
        }
      );
    };
    upsertListFolderInner("", folderArr, idx, callback);
  }
  self.createListFolder = function(folderName, callback, path) {
    path = path === void 0 ? "" : path;
    const currCtx = new SP.ClientContext.get_current();
    const web = currCtx.get_web();
    const oList = web.get_lists().getByTitle(self.config.def.title);
    let folderUrl = "";
    const itemCreateInfo = new SP.ListItemCreationInformation();
    itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);
    itemCreateInfo.set_leafName(folderName);
    if (path) {
      folderUrl = sal2.globalConfig.siteUrl + "/Lists/" + self.config.def.name + "/" + path;
      itemCreateInfo.set_folderUrl(folderUrl);
    }
    const newItem = oList.addItem(itemCreateInfo);
    newItem.set_item("Title", folderName);
    newItem.update();
    function onCreateFolderSucceeded(sender, args) {
      callback(this.newItem.get_id());
    }
    function onCreateFolderFailed(sender, args) {
      alert(
        "Request on list " + self.config.def.name + " failed, producing the following error: \n" + args.get_message() + "\nStackTrack: \n" + args.get_stackTrace()
      );
    }
    const data2 = {
      folderName,
      callback,
      newItem
    };
    currCtx.load(newItem);
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onCreateFolderSucceeded),
      Function.createDelegate(data2, onCreateFolderFailed)
    );
  };
  function ensureListFolder(path, onExists, onNonExists) {
    var folderUrl = sal2.globalConfig.siteUrl + "/Lists/" + self.config.def.name + "/" + path;
    var ctx = SP.ClientContext.get_current();
    var folder = ctx.get_web().getFolderByServerRelativeUrl(folderUrl);
    folder.get_listItemAllFields();
    var data2 = {
      folder,
      path,
      onExists,
      onNonExists
    };
    ctx.load(folder, "Exists", "Name");
    function onQueryFolderSucceeded() {
      if (folder.get_exists()) {
        let onQueryFolderItemSuccess = function() {
          onExists(folderItem);
        }, onQueryFolderItemFailure = function(sender, args) {
          console.error("Failed to find folder at " + path, args);
        };
        console.log(
          "Folder " + folder.get_name() + " exists in " + self.config.def.name
        );
        var currCtx = new SP.ClientContext.get_current();
        var folderItem = folder.get_listItemAllFields();
        data2 = { folderItem, path, onExists };
        currCtx.load(folderItem);
        currCtx.executeQueryAsync(
          Function.createDelegate(data2, onQueryFolderItemSuccess),
          Function.createDelegate(data2, onQueryFolderItemFailure)
        );
      } else {
        console.warn("Folder exists but is hidden (security-trimmed) for us.");
      }
    }
    function onQueryFolderFailed(sender, args) {
      if (args.get_errorTypeName() === "System.IO.FileNotFoundException") {
        console.log(
          "SAL.SPList.ensureListFolder:           Folder " + path + " does not exist in " + self.config.def.name
        );
        onNonExists();
      } else {
        console.error("Error: " + args.get_message());
      }
    }
    ctx.executeQueryAsync(
      Function.createDelegate(data2, onQueryFolderSucceeded),
      Function.createDelegate(data2, onQueryFolderFailed)
    );
  }
  function upsertLibFolderByPath(folderUrl, success) {
    const currCtx = new SP.ClientContext.get_current();
    const web = currCtx.get_web();
    const oList = web.get_lists().getByTitle(self.config.def.title);
    var createFolderInternal = function(parentFolder, folderUrl2, success2) {
      var ctx = parentFolder.get_context();
      var folderNames = folderUrl2.split("/");
      var folderName = folderNames[0];
      var curFolder = parentFolder.get_folders().add(folderName);
      ctx.load(curFolder);
      ctx.executeQueryAsync(
        function() {
          if (folderNames.length > 1) {
            var subFolderUrl = folderNames.slice(1, folderNames.length).join("/");
            createFolderInternal(curFolder, subFolderUrl, success2);
          } else {
            success2(curFolder);
          }
        },
        function(sender, args) {
          console.error("error creating new folder");
          console.error(sender);
          console.error(error);
        }
      );
    };
    createFolderInternal(oList.get_rootFolder(), folderUrl, success);
  }
  function setFolderPermissionsAsync(folderPath, valuePairs, reset) {
    return new Promise((resolve, reject2) => {
      setFolderPermissions(folderPath, valuePairs, resolve, reset);
    });
  }
  function setFolderPermissions(relFolderPath, valuePairs, callback, reset) {
    reset = reset === void 0 ? false : reset;
    var users = [];
    var resolvedGroups = [];
    const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
    const currCtx = new SP.ClientContext.get_current();
    const web = currCtx.get_web();
    const folder = web.getFolderByServerRelativeUrl(serverRelFolderPath);
    valuePairs.forEach(function(vp) {
      var resolvedGroup = getSPSiteGroupByName(vp[0]);
      if (resolvedGroup?.oGroup) {
        resolvedGroups.push([resolvedGroup.oGroup, vp[1]]);
      } else {
        users.push([currCtx.get_web().ensureUser(vp[0]), vp[1]]);
      }
    });
    function onFindFolderSuccess() {
      var currCtx2 = new SP.ClientContext.get_current();
      var web2 = currCtx2.get_web();
      var folderItem = this.folder.get_listItemAllFields();
      if (reset) {
        folderItem.resetRoleInheritance();
        folderItem.breakRoleInheritance(false, false);
        folderItem.get_roleAssignments().getByPrincipal(sal2.globalConfig.currentUser).deleteObject();
      } else {
        folderItem.breakRoleInheritance(false, false);
      }
      this.resolvedGroups.forEach(function(groupPairs) {
        var roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currCtx2);
        roleDefBindingColl.add(
          web2.get_roleDefinitions().getByName(groupPairs[1])
        );
        folderItem.get_roleAssignments().add(groupPairs[0], roleDefBindingColl);
      });
      this.users.forEach(function(userPairs) {
        var roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject(currCtx2);
        roleDefBindingColl.add(
          web2.get_roleDefinitions().getByName(userPairs[1])
        );
        folderItem.get_roleAssignments().add(userPairs[0], roleDefBindingColl);
      });
      var data3 = { folderItem, callback };
      function onSetFolderPermissionsSuccess() {
        console.log("Successfully set permissions");
        this.callback(folderItem);
      }
      function onSetFolderPermissionsFailure(sender, args) {
        console.error(
          "Failed to update permissions on item: " + this.folderItem.get_lookupValue() + args.get_message() + "\n" + args.get_stackTrace(),
          false
        );
      }
      currCtx2.load(folderItem);
      currCtx2.executeQueryAsync(
        Function.createDelegate(data3, onSetFolderPermissionsSuccess),
        Function.createDelegate(data3, onSetFolderPermissionsFailure)
      );
    }
    function onFindFolderFailure(sender, args) {
      console.error(
        "Something went wrong setting perms on library folder",
        args
      );
    }
    var data2 = {
      folder,
      users,
      callback,
      resolvedGroups,
      valuePairs,
      reset
    };
    users.map(function(user) {
      currCtx.load(user[0]);
    });
    currCtx.load(folder);
    currCtx.executeQueryAsync(
      Function.createDelegate(data2, onFindFolderSuccess),
      Function.createDelegate(data2, onFindFolderFailure)
    );
  }
  function showModal(formName, title, args, callback) {
    var id2 = "";
    if (args.id) {
      id2 = args.id;
    }
    const options = SP.UI.$create_DialogOptions();
    var listPath = self.config.def.isLib ? "/" + self.config.def.name + "/" : "/Lists/" + self.config.def.name + "/";
    var rootFolder = "";
    if (args.rootFolder) {
      rootFolder = sal2.globalConfig.siteUrl + listPath + args.rootFolder;
    }
    var formsPath = self.config.def.isLib ? "/" + self.config.def.name + "/forms/" : "/Lists/" + self.config.def.name + "/";
    Object.assign(options, {
      title,
      dialogReturnValueCallback: callback,
      args: JSON.stringify(args),
      height: 800,
      url: sal2.globalConfig.siteUrl + formsPath + formName + "?ID=" + id2 + "&Source=" + location.pathname + "&RootFolder=" + rootFolder
    });
    SP.UI.ModalDialog.showModalDialog(options);
  }
  function showCheckinModal(fileRef, callback) {
    var options = SP.UI.$create_DialogOptions();
    options.title = "Check in Document";
    options.height = "600";
    options.dialogReturnValueCallback = callback;
    options.url = sal2.globalConfig.siteUrl + "/_layouts/checkin.aspx?List={" + self.config.guid + "}&FileName=" + fileRef;
    SP.UI.ModalDialog.showModalDialog(options);
  }
  function checkinWithComment(fileRef, comment) {
    const url = `/web/GetFileByServerRelativeUrl('${fileRef}')/CheckIn(comment='${comment}',checkintype=0)`;
    return fetchSharePointData(url, "POST");
  }
  function showVersionHistoryModal(itemId) {
    return new Promise((resolve) => {
      var options = SP.UI.$create_DialogOptions();
      options.title = "Version History";
      options.height = "600";
      options.dialogReturnValueCallback = resolve;
      options.url = getVersionHistoryUrl(itemId);
      SP.UI.ModalDialog.showModalDialog(options);
    });
  }
  function getVersionHistoryUrl(itemId) {
    return sal2.globalConfig.siteUrl + "/_layouts/15/versions.aspx?List={" + self.config.guid + "}&ID=" + itemId;
  }
  function uploadNewDocumentAsync(folderPath, title, args) {
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      currCtx.load(oList);
      currCtx.executeQueryAsync(
        function() {
          var siteString = sal2.globalConfig.siteUrl == "/" ? "" : sal2.globalConfig.siteUrl;
          const options = SP.UI.$create_DialogOptions();
          Object.assign(options, {
            title,
            dialogReturnValueCallback: resolve,
            args: JSON.stringify(args),
            url: siteString + "/_layouts/Upload.aspx?List=" + oList.get_id().toString() + "&RootFolder=" + siteString + "/" + self.config.def.name + "/" + encodeURI(folderPath) + "&Source=" + location.pathname + "&args=" + encodeURI(JSON.stringify(args))
          });
          SP.UI.ModalDialog.showModalDialog(options);
        },
        function(sender, args2) {
          console.error("Error showing file modal: ");
          console.error(sender);
          console.error(args2);
        }
      );
    });
  }
  async function ensureFolder(relativeFolderPath) {
    const response = await fetchSharePointData(
      `/web/GetFolderByServerRelativeUrl('${relativeFolderPath}')`
    );
    if (response) return true;
    return await fetchSharePointData(
      `/web/folders`,
      "POST",
      {
        "Content-Type": "application/json;odata=verbose"
      },
      {
        body: JSON.stringify({
          __metadata: { type: "SP.Folder" },
          ServerRelativeUrl: relativeFolderPath
        })
      }
    );
  }
  const UPLOADCHUNKSIZE = 10485760;
  const uploadchunkActionTypes = {
    start: "startupload",
    continue: "continueupload",
    finish: "finishupload"
  };
  async function uploadFileRestChunking(file, relFolderPath, fileName, progress) {
    const blob = file;
    const chunkSize = UPLOADCHUNKSIZE;
    const fileSize = file.size;
    const totalBlocks = parseInt((fileSize / chunkSize).toString(), 10) + (fileSize % chunkSize === 0 ? 1 : 0);
    const fileRef = relFolderPath + "/" + fileName;
    const jobGuid = getGUID();
    let currentPointer;
    progress({ currentBlock: 0, totalBlocks });
    currentPointer = await startUpload(
      jobGuid,
      file.slice(0, chunkSize),
      fileRef,
      relFolderPath
    );
    for (i = 2; i < totalBlocks; i++) {
      progress({ currentBlock: i, totalBlocks });
      currentPointer = await continueUpload(
        jobGuid,
        file.slice(currentPointer, currentPointer + chunkSize),
        currentPointer,
        fileRef
      );
    }
    progress({ currentBlock: totalBlocks - 1, totalBlocks });
    const result = await finishUpload(
      jobGuid,
      file.slice(currentPointer),
      currentPointer,
      fileRef
    );
    progress({ currentBlock: totalBlocks, totalBlocks });
    return result;
  }
  async function startUpload(uploadId, chunk, fileRef, relFolderPath) {
    const url = `/web/getFolderByServerRelativeUrl(@folder)/files/getByUrlOrAddStub(@file)/StartUpload(guid'${uploadId}')?&@folder='${relFolderPath}'&@file='${fileRef}'`;
    const headers = {
      "Content-Type": "application/octet-stream"
    };
    const opts = {
      body: chunk
    };
    const result = await fetchSharePointData(url, "POST", headers, opts);
    if (!result) {
      console.error("Error starting upload!");
      return;
    }
    return parseFloat(result.d.StartUpload);
  }
  async function continueUpload(uploadId, chunk, fileOffset, fileRef) {
    const url = `/web/getFileByServerRelativeUrl(@file)/ContinueUpload(uploadId=guid'${uploadId}',fileOffset=${fileOffset})?&@file='${fileRef}'`;
    const headers = {
      "Content-Type": "application/octet-stream"
    };
    const opts = {
      body: chunk
    };
    const result = await fetchSharePointData(url, "POST", headers, opts);
    if (!result) {
      console.error("Error starting upload!");
      return;
    }
    return parseFloat(result.d.ContinueUpload);
  }
  async function finishUpload(uploadId, chunk, fileOffset, fileRef) {
    const url = `/web/getFileByServerRelativeUrl(@file)/FinishUpload(uploadId=guid'${uploadId}',fileOffset=${fileOffset})?&@file='${fileRef}'`;
    const headers = {
      "Content-Type": "application/octet-stream"
    };
    const opts = {
      body: chunk
    };
    const result = await fetchSharePointData(url, "POST", headers, opts);
    if (!result) {
      console.error("Error starting upload!");
      return;
    }
    return result;
  }
  async function uploadFileRest(file, relFolderPath, fileName) {
    return await fetch(
      _spPageContextInfo.webServerRelativeUrl + `/_api/web/GetFolderByServerRelativeUrl('${relFolderPath}')/Files/add(url='${fileName}',overwrite=true)`,
      {
        method: "POST",
        credentials: "same-origin",
        body: file,
        headers: {
          Accept: "application/json; odata=verbose",
          "Content-Type": "application/json;odata=nometadata",
          "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value
        }
      }
    ).then((response) => {
      if (!response.ok) {
        console.error("Error Uploading File", response);
        return;
      }
      return response.json();
    });
  }
  async function uploadFileToFolderAndUpdateMetadata(file, fileName, relFolderPath, payload, progress = null) {
    if (!progress) {
      progress = () => {
      };
    }
    const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
    if (!await ensureFolder(serverRelFolderPath)) return;
    let result = null;
    if (file.size > UPLOADCHUNKSIZE) {
      const job = () => uploadFileRestChunking(file, serverRelFolderPath, fileName, progress);
      result = await uploadQueue.addJob(job);
    } else {
      progress({ currentBlock: 0, totalBlocks: 1 });
      result = await uploadFileRest(file, serverRelFolderPath, fileName);
      progress({ currentBlock: 1, totalBlocks: 1 });
    }
    await updateUploadedFileMetadata(result.d, payload);
    await checkinWithComment(serverRelFolderPath + "/" + fileName, "");
    let itemUri = result.d.ListItemAllFields.__deferred.uri + "?$select=ID";
    const listItem = await fetchSharePointData(itemUri);
    return listItem.d.ID;
  }
  async function updateUploadedFileMetadata(fileResult, payload) {
    var result = await fetch(fileResult.ListItemAllFields.__deferred.uri, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(payload),
      headers: {
        Accept: "application/json; odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
        "X-HTTP-Method": "MERGE",
        "If-Match": "*"
      }
    }).then((response) => {
      if (!response.ok) {
        console.error("Error Updating File", response);
        return;
      }
      return response;
    });
    return result;
  }
  function copyFiles(sourceFolderPath, destFolderPath, callback, onError) {
    const sourcePath = getServerRelativeFolderPath(sourceFolderPath);
    const destPath = getServerRelativeFolderPath(destFolderPath);
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    var folderSrc = web.getFolderByServerRelativeUrl(sourcePath);
    context.load(folderSrc, "Files");
    context.executeQueryAsync(
      function() {
        var files = folderSrc.get_files();
        var e = files.getEnumerator();
        var dest = [];
        while (e.moveNext()) {
          var file = e.get_current();
          var destLibUrl = destPath + "/" + file.get_name();
          dest.push(destLibUrl);
          file.copyTo(destLibUrl, true);
        }
        console.log(dest);
        context.executeQueryAsync(
          function() {
            console.log("Files moved successfully!");
            callback();
          },
          function(sender, args) {
            console.log("error: ") + args.get_message();
            onError;
          }
        );
      },
      function(sender, args) {
        console.error("Unable to copy files: ", args.get_message());
        console.error(sender);
        console.error(args);
        reject(args);
      }
    );
  }
  function copyFilesAsync(sourceFolder, destFolder) {
    return new Promise((resolve, reject2) => {
      copyFiles(sourceFolder, destFolder, resolve, reject2);
    });
  }
  async function ensureList() {
    const listInfo = await fetchSharePointData(
      `/web/lists/GetByTitle('${self.config.def.title}')`
    );
  }
  const publicMembers = {
    findByIdAsync,
    getById,
    findByColumnValueAsync,
    loadNextPage,
    getListItemsAsync,
    createListItemAsync,
    updateListItemAsync,
    deleteListItemAsync,
    setItemPermissionsAsync,
    getItemPermissionsAsync,
    getListPermissions,
    setListPermissionsAsync,
    getFolderContentsAsync,
    upsertFolderPathAsync,
    getServerRelativeFolderPath,
    setFolderReadonlyAsync,
    setFolderPermissionsAsync,
    ensureFolderPermissionsAsync,
    uploadFileToFolderAndUpdateMetadata,
    uploadNewDocumentAsync,
    copyFilesAsync,
    showModal,
    showCheckinModal,
    showVersionHistoryModal,
    getVersionHistoryUrl
  };
  return publicMembers;
}
async function fetchSharePointData(uri, method = "GET", headers = {}, opts = {}, responseType = "json") {
  const siteEndpoint = uri.startsWith("http") ? uri : sal2.globalConfig.siteUrl + "/_api" + uri;
  const response = await fetch(siteEndpoint, {
    method,
    headers: {
      Accept: "application/json; odata=verbose",
      "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
      ...headers
    },
    ...opts
  });
  if (!response.ok) {
    if (response.status == 404) {
      return;
    }
    console.error(response);
    return;
  }
  try {
    let result;
    switch (responseType) {
      case "json":
        return response.json();
        break;
      case "blob":
        return response.blob();
        break;
      default:
        return response;
    }
  } catch (e) {
    return;
  }
}
window.fetchSharePointData = fetchSharePointData;
function getGUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  let d = Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
}
var JobProcessor = class {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.runningJobs = 0;
    this.queue = [];
  }
  addJob(asyncFunction) {
    return new Promise((resolve, reject2) => {
      const job = async () => {
        try {
          const result = await asyncFunction();
          resolve(result);
        } catch (error2) {
          reject2(error2);
        } finally {
          this.runningJobs--;
          this.processQueue();
        }
      };
      this.queue.push(job);
      this.processQueue();
    });
  }
  processQueue() {
    while (this.runningJobs < this.maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.runningJobs++;
      job();
    }
  }
};
var uploadQueue = new JobProcessor(5);

// src/sal/fields/PeopleField.js
var PeopleField = class extends BaseField {
  constructor(params) {
    super(params);
    this.spGroupName = params.spGroupName ?? null;
    this.multiple = params.multiple ?? false;
    this.Value = this.multiple ? ko.observableArray() : ko.observable();
    if (ko.isObservable(this.spGroupName)) {
      this.spGroupName.subscribe(this.spGroupNameChangedHandler);
    }
    if (ko.unwrap(this.spGroupName)) {
      this.spGroupNameChangedHandler(ko.unwrap(this.spGroupName));
    }
  }
  spGroupId = ko.observable();
  userOpts = ko.observableArray();
  expandUsers = ko.observable(false);
  spGroupNameChangedHandler = async (groupName) => {
    if (!groupName) {
      this.userOpts.removeAll();
      this.spGroupId(null);
    }
    const group = await ensureUserByKeyAsync(groupName);
    this.spGroupId(group.ID);
    const users = await getUsersByGroupName(groupName);
    this.userOpts(users.sort(sortByTitle));
  };
  pickerOptions = ko.pureComputed(() => {
    const groupId = ko.unwrap(this.spGroupId);
    const opts = {
      AllowMultipleValues: this.multiple
    };
    if (groupId) opts.SharePointGroupID = groupId;
    return opts;
  });
  toString = ko.pureComputed(() => {
    if (!this.multiple) return this.Value()?.Title;
    return this.Value()?.map((user) => user.Title);
  });
  set = (val) => {
    if (!this.multiple) {
      this.Value(People2.Create(val));
      return;
    }
    if (!val) {
      this.Value.removeAll();
      return;
    }
    const vals = val.results ?? val;
    if (!vals.length) {
      this.Value.removeAll();
      return;
    }
    this.Value(vals.map((u) => People2.Create(u)));
  };
  components = PeopleModule;
};

// src/sal/fields/SelectField.js
var SelectField = class extends BaseField {
  constructor(params) {
    super(params);
    const { options, multiple = false, optionsText } = params;
    this._options = options;
    this.Options = ko.pureComputed(() => {
      return ko.unwrap(options);
    });
    this.multiple = multiple;
    this.Value = multiple ? ko.observableArray() : ko.observable();
    this.optionsText = optionsText;
    this.components = this.multiple ? SearchSelectModule : SelectModule;
  }
  toString = ko.pureComputed(
    () => this.multiple ? this.Value().join(", ") : this.Value()
  );
  get = () => this.Value();
  set = (val) => {
    if (val && this.multiple) {
      if (Array.isArray(val)) {
        this.Value(val);
      } else {
        this.Value(val.results ?? val.split(";#"));
      }
      return;
    }
    this.Value(val);
  };
  // Options = ko.observableArray();
};

// src/sal/fields/TextAreaField.js
var TextAreaField = class extends BaseField {
  constructor(params) {
    super(params);
    this.isRichText = params.isRichText;
    this.attr = params.attr ?? {};
  }
  components = TextAreaModule;
};

// src/sal/fields/TextField.js
var TextField = class extends BaseField {
  constructor(params) {
    super(params);
    this.attr = params.attr ?? {};
    this.options = params.options ?? null;
  }
  components = TextModule;
};

// src/sal/primitives/constrained_entity.js
var ConstrainedEntity = class extends Entity {
  constructor(params) {
    super(params);
  }
  toJSON = () => {
    const out = {};
    Object.keys(this.FieldMap).map(
      (key) => out[key] = this.FieldMap[key]?.get()
    );
    return out;
  };
  fromJSON(inputObj) {
    if (window.DEBUG)
      console.log("Setting constrained entity from JSON", inputObj);
    Object.keys(inputObj).map((key) => this.FieldMap[key]?.set(inputObj[key]));
  }
  get FieldMap() {
    const fieldMap = {};
    Object.entries(this).filter(([key, val]) => val instanceof BaseField).map(([key, val]) => {
      key = val.systemName ?? key;
      fieldMap[key] = val;
    });
    return fieldMap;
  }
  FormFields = () => Object.values(this.FieldMap);
  // Validate the entire entity
  validate = (showErrors = true) => {
    Object.values(this.FieldMap).map(
      (field) => field?.validate && field.validate(showErrors)
    );
    return this.Errors();
  };
  Errors = ko.pureComputed(() => {
    return Object.values(this.FieldMap).filter((field) => field?.Errors && field.Errors()).flatMap((field) => field.Errors());
  });
  IsValid = ko.pureComputed(() => !this.Errors().length);
  /**
   * Expose methods to generate default new, edit, and view forms
   * for a constrained entity. Uses the constrained
   * entity components.
   *
   * This could be broken into a separate service, but since it's
   * tightly coupled leave it here?
   */
  // static components = {
  //   new: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "edit",
  //     }),
  //   edit: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "edit",
  //     }),
  //   view: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "view",
  //     }),
  // };
};

// src/sal/primitives/domain_error.js
var DomainError = class {
  constructor({ source, entity, description }) {
    this.source = source;
    this.entity = entity;
    this.description = description;
  }
};

// src/sal/entities/SitePage.js
var SitePage = class extends Entity {
  constructor(params) {
    super(params);
  }
  static Views = {
    All: ["ID", "Title", "Created", "Author", "Modified", "Editor"]
  };
  static ListDef = {
    name: "SitePages",
    title: "Site Pages"
  };
};

// src/env.js
var assetsPath = "/sites/CGFS/Style Library/apps/car-cap/src";

// src/sal/infrastructure/knockout_extensions.js
ko.subscribable.fn.subscribeChanged = function(callback) {
  var oldValue;
  this.subscribe(
    function(_oldValue) {
      oldValue = _oldValue;
    },
    this,
    "beforeChange"
  );
  this.subscribe(function(newValue) {
    callback(newValue, oldValue);
  });
};
ko.observableArray.fn.subscribeAdded = function(callback) {
  this.subscribe(
    function(arrayChanges) {
      const addedValues = arrayChanges.filter((value) => value.status == "added").map((value) => value.value);
      callback(addedValues);
    },
    this,
    "arrayChange"
  );
};
ko.bindingHandlers.searchSelect = {
  init: function(element, valueAccessor, allBindingsAccessor) {
    const { options, selectedOptions, optionsText, onSearchInput } = valueAccessor();
    function populateOpts() {
      const optionItems = ko.unwrap(options);
      const optionElements = optionItems.map((option) => {
        const optionElement = document.createElement("option");
        ko.selectExtensions.writeValue(optionElement, ko.unwrap(option));
        optionElement.innerText = optionsText(option);
        if (ko.unwrap(selectedOptions)?.find((selectedOption) => selectedOption.ID == option.ID)) {
          optionElement.setAttribute("selected", "");
        }
        return optionElement;
      });
      element.append(...optionElements);
    }
    populateOpts();
    if (ko.isObservable(options)) {
      options.subscribe(() => populateOpts(), this);
    }
    ko.utils.registerEventHandler(element, "change", (e) => {
      selectedOptions(
        element.selectedOptions.map((opt) => ko.selectExtensions.readValue(opt))
      );
    });
    if (onSearchInput) {
      ko.utils.registerEventHandler(element, "input", (e) => {
        onSearchInput(e.originalEvent.target.searchInputElement.value);
      });
    }
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    const { selectedOptions } = valueAccessor();
    const selectedUnwrapped = ko.unwrap(selectedOptions);
    for (var i2 = 0; i2 < element.options.length; i2++) {
      const o = element.options[i2];
      o.toggleAttribute(
        "selected",
        selectedUnwrapped.includes(ko.selectExtensions.readValue(o))
      );
    }
  }
};
ko.bindingHandlers.people = {
  init: function(element, valueAccessor, allBindingsAccessor) {
    var schema = {};
    schema["PrincipalAccountType"] = "User";
    schema["SearchPrincipalSource"] = 15;
    schema["ShowUserPresence"] = true;
    schema["ResolvePrincipalSource"] = 15;
    schema["AllowEmailAddresses"] = true;
    schema["AllowMultipleValues"] = false;
    schema["MaximumEntitySuggestions"] = 50;
    schema["OnUserResolvedClientScript"] = async function(elemId, userKeys) {
      var pickerControl = SPClientPeoplePicker.SPClientPeoplePickerDict[elemId];
      var observable = valueAccessor();
      var userJSObject = pickerControl.GetControlValueAsJSObject()[0];
      if (!userJSObject) {
        observable(null);
        return;
      }
      if (userJSObject.IsResolved) {
        if (userJSObject.Key == observable()?.LoginName) return;
        var user = await ensureUserByKeyAsync(userJSObject.Key);
        var person = new People2(user);
        observable(person);
      }
    };
    SPClientPeoplePicker_InitStandaloneControlWrapper(element.id, null, schema);
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var pickerControl = SPClientPeoplePicker.SPClientPeoplePickerDict[element.id + "_TopSpan"];
    var userValue = ko.utils.unwrapObservable(valueAccessor());
    if (!userValue) {
      pickerControl?.DeleteProcessedUser();
      return;
    }
    if (userValue && !pickerControl.GetAllUserInfo().find((pickerUser) => pickerUser.DisplayText == userValue.LookupValue)) {
      pickerControl.AddUserKeys(
        userValue.LoginName ?? userValue.LookupValue ?? userValue.Title
      );
    }
  }
};
ko.bindingHandlers.dateField = {
  init: function(element, valueAccessor, allBindingsAccessor) {
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
  }
};
ko.bindingHandlers.downloadLink = {
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var path = valueAccessor();
    var replaced = path.replace(/:([A-Za-z_]+)/g, function(_, token) {
      return ko.unwrap(viewModel[token]);
    });
    element.href = replaced;
  }
};
ko.bindingHandlers.files = {
  init: function(element, valueAccessor) {
    function addFiles(fileList) {
      var value = valueAccessor();
      if (!fileList.length) {
        value.removeAll();
        return;
      }
      const existingFiles = ko.unwrap(value);
      const newFileList = [];
      for (let file of fileList) {
        if (!existingFiles.find((exFile) => exFile.name == file.name))
          newFileList.push(file);
      }
      ko.utils.arrayPushAll(value, newFileList);
      return;
    }
    ko.utils.registerEventHandler(element, "change", function() {
      addFiles(element.files);
    });
    const label = element.closest("label");
    if (!label) return;
    ko.utils.registerEventHandler(label, "dragover", function(event) {
      event.preventDefault();
      event.stopPropagation();
    });
    ko.utils.registerEventHandler(label, "dragenter", function(event) {
      event.preventDefault();
      event.stopPropagation();
      label.classList.add("dragging");
    });
    ko.utils.registerEventHandler(label, "dragleave", function(event) {
      event.preventDefault();
      event.stopPropagation();
      label.classList.remove("dragging");
    });
    ko.utils.registerEventHandler(label, "drop", function(event) {
      event.preventDefault();
      event.stopPropagation();
      let dt = event.originalEvent.dataTransfer;
      let files = dt.files;
      addFiles(files);
    });
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    const value = valueAccessor();
    if (!value().length && element.files.length) {
      element.value = null;
      return;
    }
    return;
  }
};
ko.bindingHandlers.toggleClick = {
  init: function(element, valueAccessor, allBindings) {
    var value = valueAccessor();
    ko.utils.registerEventHandler(element, "click", function() {
      var classToToggle = allBindings.get("toggleClass");
      var classContainer = allBindings.get("classContainer");
      var containerType = allBindings.get("containerType");
      if (containerType && containerType == "sibling") {
        $(element).nextUntil(classContainer).each(function() {
          $(this).toggleClass(classToToggle);
        });
      } else if (containerType && containerType == "doc") {
        var curIcon = $(element).attr("src");
        if (curIcon == "/_layouts/images/minus.gif")
          $(element).attr("src", "/_layouts/images/plus.gif");
        else $(element).attr("src", "/_layouts/images/minus.gif");
        if ($(element).parent() && $(element).parent().parent()) {
          $(element).parent().parent().nextUntil(classContainer).each(function() {
            $(this).toggleClass(classToToggle);
          });
        }
      } else if (containerType && containerType == "any") {
        if ($("." + classToToggle).is(":visible"))
          $("." + classToToggle).hide();
        else $("." + classToToggle).show();
      } else $(element).find(classContainer).toggleClass(classToToggle);
    });
  }
};
ko.bindingHandlers.toggles = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    ko.utils.registerEventHandler(element, "click", function() {
      value(!value());
    });
  }
};
var fromPathTemplateLoader = {
  loadTemplate: function(name, templateConfig, callback) {
    if (templateConfig.fromPath) {
      fetch(assetsPath + templateConfig.fromPath).then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error Fetching HTML Template - ${response.statusText}`
          );
        }
        return response.text();
      }).catch((error2) => {
        if (!templateConfig.fallback) return;
        console.warn(
          "Primary template not found, attempting fallback",
          templateConfig
        );
        fetch(assetsPath + templateConfig.fallback).then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error Fetching fallback HTML Template - ${response.statusText}`
            );
          }
          return response.text();
        }).then(
          (text) => ko.components.defaultLoader.loadTemplate(name, text, callback)
        );
      }).then(
        (text) => text ? ko.components.defaultLoader.loadTemplate(name, text, callback) : null
      );
    } else {
      callback(null);
    }
  }
};
ko.components.loaders.unshift(fromPathTemplateLoader);
var fromPathViewModelLoader = {
  loadViewModel: function(name, viewModelConfig, callback) {
    if (viewModelConfig.viaLoader) {
      const module = import(assetsPath + viewModelConfig.viaLoader).then(
        (module2) => {
          const viewModelConstructor = module2.default;
          ko.components.defaultLoader.loadViewModel(
            name,
            viewModelConstructor,
            callback
          );
        }
      );
    } else {
      callback(null);
    }
  }
};
ko.components.loaders.unshift(fromPathViewModelLoader);

// src/sal/infrastructure/register_components.js
var html2 = String.raw;
function directRegisterComponent(name, { template: template6, viewModel = null }) {
  ko.components.register(name, {
    template: template6,
    viewModel
  });
}

// src/sal/infrastructure/authorization.js
async function getUsersByGroupName(groupName) {
  const users = await getGroupUsers(groupName);
  if (!users) return [];
  return users.map((userProps) => new People(userProps));
}

// src/constants.js
var html3 = String.raw;
var ROLES2 = {
  ADMINTYPE: {
    USER: "",
    QO: "qo",
    QTM: "qtm",
    QTMB: "qtm-b"
  },
  SUBMITTER: "submitter",
  COORDINATOR: "coordinator",
  IMPLEMENTOR: "implementor",
  // This person is able push the record forward
  ACTIONRESPONSIBLEPERSON: "actionresponsibleperson",
  QSO: "qso",
  QAO: "qao"
};
var PLANTYPE = {
  CAP: "CAP",
  CAR: "CAR"
};
var SUPPORTINGDOCUMENTTYPES = {
  SUPPORT: "Support",
  EFFECTIVENESS: "Effectiveness"
};
var LOCATION = {
  ALL: "All",
  CHARLESTON: "Charleston",
  BANGKOK: "Bangkok",
  WASHINGTON: "Washington",
  PARIS: "Paris",
  SOFIA: "Sofia",
  MANILA: "Manila"
};
var ACTIONSTATES = {
  PLANAPPROVAL: "Pending Plan Approval",
  INPROGRESS: "In progress",
  COMPLETED: "Completed",
  COMPLETEDAPPROVAL: "Completed: Requires Approval",
  QSOAPPROVAL: "Requires Approval QSO",
  QAOAPPROVAL: "Requires Approval QAO",
  QTMAPPROVAL: "Requires Approval QTM"
};
var SITEROLEGROUPS = {
  USER: {
    GROUPNAME: "Continuous Improvement Visitors",
    DISPLAYNAME: "USER",
    ROLE: ""
  },
  QOS: { GROUPNAME: "QOs", DISPLAYNAME: "QSO/QAO", ROLE: "qo" },
  QOSTEMP: { GROUPNAME: "QOsTemp", DISPLAYNAME: "QSOs/QAOs", ROLE: "qo" },
  QTM: { GROUPNAME: "QTM", DISPLAYNAME: "QTM", ROLE: "qtm" },
  QTMB: { GROUPNAME: "QTM B", DISPLAYNAME: "QTM B", ROLE: "qtm-b" }
};
var stageDescriptions = {
  Editing: {
    stage: "Editing",
    description: "CAR has been rejected by Quality Owner, to be closed by QTM.",
    stageNum: 1,
    progress: "5%"
  },
  ProblemApprovalQTMB: {
    actionTaker: ROLES2.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Problem Approval",
    description: "CAR originated in CGFS-B, problem must be approved by QTM-B.",
    stageNum: 1,
    progress: "5%",
    next: function() {
      return "ProblemApprovalQTM";
    },
    onReject: function() {
      return "Editing";
    }
  },
  ProblemApprovalQTM: {
    actionTaker: ROLES2.ADMINTYPE.QTM,
    stage: "Pending QTM Problem Approval",
    description: "CAR problem must be approved by QTM.",
    stageNum: 1,
    progress: "10%",
    next: function() {
      return "ProblemApprovalQSO";
    },
    onReject: function() {
      return "Editing";
    }
  },
  ProblemApprovalQSO: {
    actionTaker: ROLES2.QSO,
    stage: "Pending QSO Problem Approval",
    description: "CAR problem must be approved by QSO",
    stageNum: 1,
    progress: "15%",
    next: function() {
      return "DevelopingActionPlan";
    },
    onReject: function() {
      return "ProblemApprovalQAO";
    }
  },
  ProblemApprovalQAO: {
    actionTaker: ROLES2.QAO,
    stage: "Pending QAO Problem Approval",
    description: "CAR rejected by QSO, problem must be approved by QAO",
    stageNum: 1,
    progress: "20%",
    next: function() {
      return "DevelopingActionPlan";
    },
    onReject: function() {
      return "Editing";
    }
  },
  DevelopingActionPlan: {
    actionTaker: ROLES2.IMPLEMENTOR,
    stage: "Developing Action Plan",
    description: "Initiator or CAR/CAP Coordinator must create an action plan. Add at least one action to continue.",
    stageNum: 2,
    progress: "25%",
    next: function() {
      return "PlanApprovalQSO";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  PlanApprovalQSO: {
    actionTaker: ROLES2.QSO,
    stage: "Pending QSO Plan Approval",
    description: "Quality Owner must approve the action plan.",
    stageNum: 2,
    progress: "33%",
    next: function() {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "PlanApprovalQTMB";
      }
      return "PlanApprovalQTM";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  PlanApprovalQSOAction: {
    actionTaker: ROLES2.QSO,
    stage: "Pending QSO Plan Approval: Action",
    description: "An action has been edited, the quality owner must approve it.",
    stageNum: 2,
    progress: "33%",
    next: function() {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "PlanApprovalQTMB";
      }
      return "PlanApprovalQTM";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  PlanApprovalQTMB: {
    actionTaker: ROLES2.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Plan Approval",
    description: "QTM-B must approve the action plan.",
    stageNum: 2,
    progress: "40%",
    next: function() {
      return "PlanApprovalQTM";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  PlanApprovalQTM: {
    actionTaker: ROLES2.ADMINTYPE.QTM,
    stage: "Pending QTM Plan Approval",
    description: "QTM must approve the action plan.",
    stageNum: 2,
    progress: "40%",
    next: function() {
      return "ImplementingActionPlan";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  ImplementingActionPlan: {
    actionTaker: ROLES2.IMPLEMENTOR,
    stage: "Implementing Action Plan",
    description: "Responsible party must complete action items.  When all actions are completed, CAR/CAP Coordinator proposes Target Verification Date to move to Stage 4.",
    stageNum: 3,
    progress: "50%",
    next: function() {
      return "ImplementationApproval";
    },
    onReject: function() {
      return "DevelopingActionPlan";
    }
  },
  ImplementationApproval: {
    actionTaker: ROLES2.QSO,
    stage: "Pending QSO Implementation Approval",
    description: "Quality Owner must sign off on completion of action plan and effectiveness verification target date.",
    stageNum: 3,
    progress: "63%",
    next: function() {
      return "EffectivenessSubmission";
    },
    onReject: function() {
      return "ImplementingActionPlan";
    }
  },
  EffectivenessSubmission: {
    actionTaker: ROLES2.IMPLEMENTOR,
    stage: "Pending Effectiveness Submission",
    description: "The user must provide proof of effectiveness and submit this record.",
    stageNum: 4,
    progress: "75%",
    next: function() {
      return "EffectivenessApprovalQSO";
    },
    onReject: function() {
      return "ImplementingActionPlan";
    }
  },
  EffectivenessSubmissionRejected: {
    actionTaker: ROLES2.IMPLEMENTOR,
    stage: "Pending Effectiveness Submission: Rejected",
    description: "The user must provide additional proof of effectiveness and re-submit this record.",
    stageNum: 4,
    progress: "75%"
  },
  EffectivenessApprovalQSO: {
    actionTaker: ROLES2.QSO,
    stage: "Pending QSO Effectiveness Approval",
    description: "The Quality Owner must approve the proof of effectiveness.",
    stageNum: 4,
    progress: "80%",
    next: function() {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "EffectivenessApprovalQTMB";
      }
      return "EffectivenessApprovalQTM";
    },
    onReject: function() {
      var rejectReason = $("#selectEffectivenessRejectReason").val();
      switch (rejectReason) {
        case "Lack of Evidence":
          return "EffectivenessSubmissionRejected";
        case "Not Effective":
          return "DevelopingActionPlan";
      }
    }
  },
  EffectivenessApprovalQTMB: {
    actionTaker: ROLES2.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Effectiveness Approval",
    description: "This record originated in Bangkok, and effectiveness must be approved at QTM-B.",
    stageNum: 4,
    progress: "85%"
  },
  EffectivenessApprovalQTM: {
    actionTaker: ROLES2.ADMINTYPE.QTM,
    stage: "Pending QTM Effectiveness Approval",
    description: "The QTM must approve the proof of effectiveness.",
    stageNum: 4,
    progress: "90%"
  },
  ClosedAccepted: {
    stage: "Closed: Accepted",
    description: "This action plan has been completed and the verification accepted.",
    stageNum: 5,
    progress: "100%"
  },
  ClosedRejected: {
    stage: "Closed: Rejected",
    description: "This action plan has been rejected by the QTM.",
    stageNum: 5,
    progress: "100%"
  },
  ClosedRecalled: {
    stage: "Closed: Closed by Submitter",
    description: "This action plan has been closed by the submitter.",
    stageNum: 5,
    progress: "100%"
  }
};

// src/entities/action.js
var Action = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  PendingApproval = ko.pureComputed(() => {
    [
      ACTIONSTATES.QSOAPPROVAL,
      ACTIONSTATES.QAOAPPROVAL,
      ACTIONSTATES.QTMAPPROVAL
    ].includes(this.ImplementationStatus.Value());
  });
  Title = new TextField({
    displayName: "Plan #",
    isEditable: false
  });
  ActionID = new TextField({
    displayName: "Action ID",
    isEditable: false
  });
  ActionDescription = new TextAreaField({
    displayName: "Action Description",
    isRequired: true,
    isRichText: true,
    classList: ["min-w-full"]
  });
  TargetDate = new DateField({
    displayName: "Target Date",
    isRequired: true
  });
  ActionResponsiblePerson = new PeopleField({
    displayName: "Action Responsible Person",
    isRequired: true
  });
  RevisionCount = new TextField({
    displayName: "Revision Count",
    isEditable: false,
    attr: {
      type: "number"
    }
  });
  ImplementationStatus = new SelectField({
    displayName: "Status",
    options: Object.values(ACTIONSTATES),
    isEditable: false
  });
  ImplementationDate = new DateField({
    displayName: "Implementation Date",
    isEditable: false
  });
  PreviousActionDescription = new TextAreaField({
    displayName: "Previous Action Description",
    isRequired: false,
    isRichText: true,
    classList: ["min-w-full"],
    isEditable: false,
    isVisible: this.PendingApproval
  });
  PreviousTargetDate = new DateField({
    displayName: "Previous Target Date",
    isRequired: false,
    isEditable: false,
    isVisible: this.PendingApproval
  });
  PreviousActionResponsiblePerson = new PeopleField({
    displayName: "Previous Action Responsible Person",
    isRequired: false,
    isEditable: false,
    isVisible: this.PendingApproval
  });
  static Views = {
    All: [
      "ID",
      "Title",
      "ActionID",
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "RevisionCount",
      "ImplementationStatus",
      "ImplementationDate",
      "PrevImplementationStatus",
      "PreviousActionDescription",
      "PreviousTargetDate",
      "PreviousActionResponsiblePerson"
    ],
    New: [
      "ActionID",
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson"
    ],
    Edit: [
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "RevisionCount",
      "ImplementationStatus"
    ],
    EditApproval: [
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "RevisionCount",
      "ImplementationStatus",
      "PreviousActionDescription",
      "PreviousTargetDate",
      "PreviousActionResponsiblePerson"
    ]
  };
  static ListDef = {
    name: "CAP_Actions",
    title: "CAP_Actions"
  };
};

// src/infrastructure/store.js
var businessOfficeStore = ko.observableArray();
var sourcesStore = ko.observableArray();

// src/entities/plan.js
var Plan = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  isCAP = ko.pureComputed(() => {
    return ko.unwrap(this.RecordType.Value) == PLANTYPE.CAP;
  });
  isCAR = ko.pureComputed(() => {
    return ko.unwrap(this.RecordType.Value) == PLANTYPE.CAR;
  });
  isSelfInitiated = ko.pureComputed(() => {
    return ko.unwrap(this.SelfInitiated.Value) == "Yes";
  });
  isSelfInitiatedCAR = ko.pureComputed(() => {
    return ko.unwrap(this.RecordType.Value) == PLANTYPE.CAR && ko.unwrap(this.SelfInitiated.Value) == "Yes";
  });
  sourceOptions = ko.pureComputed(() => {
    let recordTypeSources = sourcesStore()?.filter(
      (source) => source.RecordType.Value() == RECORDSOURCETYPES.BOTH || source.RecordType.Value() == this.RecordType.Value()
    );
    if (this.isSelfInitiatedCAR()) {
      recordTypeSources = recordTypeSources.filter(
        (source) => source.SelfInitiated.Value() == this.SelfInitiated.Value()
      );
    }
    return recordTypeSources.map((source) => source.Title.toString());
  });
  Active = new CheckboxField({
    displayName: "Active"
  });
  Title = new TextField({
    displayName: "Item #",
    isEditable: false
  });
  // NEW FORM
  RecordType = new SelectField({
    displayName: "Record Type",
    options: ["CAR", "CAP"],
    isRequired: true
  });
  Source = new SelectField({
    displayName: "Source",
    options: this.sourceOptions,
    isRequired: true,
    classList: ["min-w-full"]
  });
  BusinessOffice = new LookupField({
    displayName: "Business Office",
    type: BusinessOffice,
    options: businessOfficeStore,
    appContext: () => appContext,
    isRequired: true
  });
  CGFSLocation = new SelectField({
    displayName: "Location",
    options: Object.values(LOCATION),
    isRequired: true
  });
  QSO = new PeopleField({
    displayName: "Quality Segment Owner",
    isRequired: true
  });
  QSOName = new TextField({
    displayName: "QSO Name",
    isVisible: true,
    isEditable: false
  });
  QAO = new PeopleField({
    displayName: "Quality Area Owner",
    isRequired: true
  });
  QAOName = new TextField({
    displayName: "QAO Name",
    isVisible: true,
    isEditable: false
  });
  Subject = new TextField({
    displayName: "Subject",
    isRequired: true,
    classList: ["min-w-full"]
  });
  // CAR
  SelfInitiated = new SelectField({
    displayName: "Self Initiated",
    options: ["Yes", "No"],
    defaultValue: "Yes",
    instructions: "Are you opening this on behalf of your own business office?",
    isRequired: this.isCAR,
    isVisible: this.isCAR
  });
  ProblemDescription = new TextAreaField({
    displayName: "Problem Description",
    isRequired: this.isCAR,
    isVisible: this.isCAR,
    classList: ["min-w-full"],
    isRichText: true
  });
  ContainmentAction = new TextAreaField({
    displayName: "Containment Action",
    isRequired: this.isSelfInitiatedCAR,
    isVisible: this.isSelfInitiatedCAR,
    classList: ["min-w-full"],
    isRichText: true
  });
  ContainmentActionDate = new DateField({
    displayName: "Containment Action Date",
    isRequired: this.isSelfInitiatedCAR,
    isVisible: this.isSelfInitiatedCAR,
    type: dateFieldTypes.date
  });
  RootCauseDetermination = new TextAreaField({
    displayName: "Root Cause Determination"
  });
  // CAP
  OFIDescription = new TextAreaField({
    displayName: "Opportunity for Improvement",
    isRequired: this.isCAP,
    isVisible: this.isCAP,
    classList: ["min-w-full"],
    isRichText: true
  });
  DiscoveryDataAnalysis = new TextAreaField({
    displayName: "Data, Discovery, and Analysis",
    isRequired: this.isCAP,
    isVisible: this.isCAP,
    classList: ["min-w-full"],
    isRichText: true
  });
  // Other
  SubmittedDate = new DateField({
    displayName: "Submitted On"
  });
  ProcessStage = new SelectField({
    displayName: "Status"
  });
  PreviousStage = new TextField({
    displayName: "Previous Stage",
    isVisible: false,
    isEditable: false
  });
  NextTargetDate = new DateField({
    displayName: "Next Target Date"
  });
  ProblemResolverName = new PeopleField({
    displayName: "CAR/CAP Coordinator"
  });
  CoordinatorName = new TextField({
    displayName: "CAR/CAP Coordinator Name",
    isVisible: true,
    isEditable: false
  });
  CloseDate = new DateField({
    displayName: "Closed On",
    type: dateFieldTypes.datetime
  });
  CancelReason = new TextAreaField({
    displayName: "Cancellation Reason",
    instructions: "Please provide a reason for cancelling this plan.",
    isRichText: true,
    classList: ["min-w-full"],
    isRequired: true
  });
  ExtensionCount = new TextField({
    displayName: "Extension Count"
  });
  OfficeImpactBool = new CheckboxField({
    displayName: "Has Impact on Office Risks, Mitigations, or Internal Controls"
  });
  OfficeImpactDesc = new TextAreaField({
    displayName: "Office Impact Description"
  });
  ImplementationTargetDate = new DateField({
    displayName: "Implementation Target Date"
  });
  QSOImplementAdjudicationDate = new DateField({
    displayName: "QSO Implementation Adjudication Date"
  });
  EffectivenessVerificationTargetD = new DateField({
    displayName: "Effectiveness Verification Target Date"
  });
  EffectivenessDescription = new TextAreaField({
    displayName: "Effectiveness Description"
  });
  Author = new PeopleField({
    displayName: "Submitted By"
  });
  AuthorName = new TextField({
    displayName: "Submitted By Name",
    isVisible: true,
    isEditable: false
  });
  flatten() {
    const plan = this;
    console.log("Flattening Plan: ", plan.Title.Value());
    const coordinatorName = ko.unwrap(plan.ProblemResolverName.Value)?.Title;
    plan.CoordinatorName.Value(coordinatorName);
    const qaoName = ko.unwrap(plan.QAO.Value)?.Title;
    plan.QAOName.Value(qaoName);
    const qsoName = ko.unwrap(plan.QSO.Value)?.Title;
    plan.QSOName.Value(qsoName);
    const authorName = ko.unwrap(plan.Author.Value)?.Title;
    plan.AuthorName.Value(authorName);
  }
  static Views = {
    All: [
      "ID",
      "Title",
      "Active",
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "ProblemResolverName",
      "CoordinatorName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "RootCauseDetermination",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
      "ExtensionCount",
      "ImplementationTargetDate",
      "OfficeImpactBool",
      "OfficeImpactDesc",
      "QSOImplementAdjudicationDate",
      "EffectivenessVerificationTargetD",
      "EffectivenessDescription",
      "CancelReason",
      "CloseDate",
      "Author",
      "AuthorName"
    ],
    View: [
      "Title",
      "Active",
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "CGFSLocation",
      "QSOName",
      "QAOName",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "CoordinatorName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
      "AuthorName"
    ],
    New: [
      "RecordType",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate"
    ],
    QTMEditForm: [
      "Title",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate",
      "ProblemResolverName"
    ],
    QTMEditSubmit: [
      "Title",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate",
      "ProblemResolverName",
      "CoordinatorName"
    ],
    SubmitterEditForm: [
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "ProblemDescription"
    ],
    SubmitterEditSubmit: [
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "ProblemDescription"
    ],
    Cancel: ["CancelReason"],
    CancelSubmit: [
      "Active",
      "CancelReason",
      "ProcessStage",
      "CloseDate",
      "PreviousStage"
    ]
  };
  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main"
  };
};

// src/entities/business-office.js
var BusinessOffice = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  Title = new TextField({
    displayName: "Title"
  });
  QAO = new PeopleField({
    displayName: "Quality Area Ownew"
  });
  QSO_Charleston = new PeopleField({
    displayName: "QSO Charleston"
  });
  QSO_Bangkok = new PeopleField({
    displayName: "QSO Bangkok"
  });
  QSO_Washington = new PeopleField({
    displayName: "QSO Washington"
  });
  QSO_Paris = new PeopleField({
    displayName: "QSO Paris"
  });
  QSO_Sofia = new PeopleField({
    displayName: "QSO Sofia"
  });
  QSO_Manilla = new PeopleField({
    displayName: "QSO Manilla"
  });
  getQSOByLocation(location2) {
    switch (location2) {
      case LOCATION.CHARLESTON:
        return this.QSO_Charleston;
      case LOCATION.BANGKOK:
        return this.QSO_Bangkok;
      case LOCATION.WASHINGTON:
        return this.QSO_Washington;
      case LOCATION.PARIS:
        return this.QSO_Paris;
      case LOCATION.SOFIA:
        return this.QSO_Sofia;
      case LOCATION.MANILA:
        return this.QSO_Manilla;
    }
  }
  // QSO_ = new PeopleField({
  //     displayName: "QSO "
  // })
  static Views = {
    All: [
      "ID",
      "Title",
      "QAO",
      "QSO_Charleston",
      "QSO_Bangkok",
      "QSO_Washington",
      "QSO_Paris",
      "QSO_Sofia",
      "QSO_Manila"
    ]
  };
  static ListDef = {
    name: "Business_Office",
    title: "Business_Office"
  };
};

// src/entities/notification.js
var Notification = class _Notification extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  Title = new TextField({
    displayName: "Subject",
    isRequired: true
  });
  To = new TextField({
    displayName: "To",
    isRequired: true
  });
  CC = new TextField({
    displayName: "To",
    isRequired: true
  });
  BCC = new TextField({
    displayName: "To",
    isRequired: true
  });
  Subject = new TextField({
    displayName: "Subject",
    isRequired: true
  });
  Body = new TextAreaField({
    displayName: "Body",
    isRequired: true,
    isRichText: true
  });
  Sent = new DateField({
    displayName: "Sent On",
    type: dateFieldTypes.datetime
  });
  static FromTemplate({ title, to, cc = null, bcc = null, subject, body }) {
    const notification = new _Notification();
    notification.Title.Value(title);
    notification.To.Value(sanitizeEmails(to));
    notification.CC.Value(sanitizeEmails(cc));
    notification.BCC.Value(sanitizeEmails(bcc));
    notification.Subject.Value(subject);
    notification.Body.Value(body);
    return notification;
  }
  static Views = {
    All: ["To", "CC", "BCC", "Title", "Subject", "Body", "Sent"]
  };
  static ListDef = {
    name: "Notifications",
    title: "Notifications"
  };
};
function sanitizeEmails(emails) {
  if (!emails) return;
  return [...new Set(emails.filter((n) => n))].join(";");
}

// src/entities/record-source.js
var RECORDSOURCETYPES = { CAR: "CAR", CAP: "CAP", BOTH: "BOTH" };
var RecordSource = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  Title = new TextField({
    displayName: "Title"
  });
  RecordType = new SelectField({
    displayName: "Record Type",
    options: Object.values(RECORDSOURCETYPES)
  });
  SelfInitiated = new CheckboxField({
    displayName: "Self Initiated"
  });
  static Views = {
    All: ["ID", "Title", "RecordType", "SelfInitiated"]
  };
  static ListDef = {
    name: "Record_Sources",
    title: "Record_Sources"
  };
};

// src/entities/rejection.js
var Rejection = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  showEffectivenessReason = ko.pureComputed(() => {
    return this.Stage.Value();
  });
  Title = new TextField({
    displayName: "Plan ID",
    isEditable: false
  });
  RejectionId = new TextField({
    displayName: "Rejection ID",
    isEditable: false
  });
  //   EffectivenessReason = new SelectField({
  //     displayName: "Effectiveness Deficiency",
  //     options: Object.values(EFFECTIVENESSREASONS)
  //   })
  Reason = new TextAreaField({
    displayName: "Rejection Reason",
    isRequired: true,
    classList: ["min-w-full"]
  });
  Stage = new TextField({
    displayName: "Stage",
    isEditable: false
  });
  Rejector = new TextField({
    displayName: "Rejected By",
    isEditable: false
  });
  Active = new CheckboxField({
    displayName: "Active",
    isEditable: false
  });
  Created = new DateField({
    displayName: "Rejected On",
    type: dateFieldTypes.datetime,
    isEditable: false
  });
  Modified = new DateField({
    displayName: "Modified On",
    type: dateFieldTypes.datetime,
    isEditable: false
  });
  static Views = {
    All: [
      "ID",
      "Title",
      "RejectionId",
      "Reason",
      "Stage",
      "Rejector",
      "Active",
      "Created",
      "Modified"
    ],
    New: ["Title", "RejectionId", "Reason", "Stage", "Rejector", "Active"]
  };
  static ListDef = {
    name: "Rejections",
    title: "Rejections"
  };
};

// src/entities/root-cause-why.js
var RootCauseWhy = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  Title = new TextField({
    displayName: "Title",
    isEditable: false
  });
  Number = new TextField({
    displayName: "Number",
    isEditable: false
  });
  Question = new TextAreaField({
    displayName: "Question",
    isRequired: true,
    classList: ["min-w-full"]
  });
  Answer = new TextAreaField({
    displayName: "Answer",
    isRequired: true,
    classList: ["min-w-full"]
  });
  static Views = {
    All: ["ID", "Title", "Number", "Question", "Answer"]
  };
  static ListDef = {
    name: "Root_Cause_Why",
    title: "Root_Cause_Why"
  };
};

// src/entities/support-doc.js
var SupportingDocument = class extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }
  Record = new TextField({
    displayName: "Plan Number",
    isEditable: false
  });
  Title = new TextField({
    displayName: "Title"
  });
  FileName = new TextField({
    displayName: "Name",
    systemName: "FileLeafRef"
  });
  DocType = new SelectField({
    displayName: "Document Type",
    options: Object.values(SUPPORTINGDOCUMENTTYPES),
    isRequired: true,
    isEditable: false
  });
  FileRef = new TextField({
    displayName: "File Link",
    systemName: "FileRef"
  });
  Modified = new DateField({
    displayName: "Modified",
    type: dateFieldTypes.datetime
  });
  Editor = new PeopleField({
    displayName: "Modified By"
  });
  Created = new DateField({
    displayName: "Created",
    type: dateFieldTypes.datetime
  });
  Author = new PeopleField({
    displayName: "Created By"
  });
  static Views = {
    All: [
      "ID",
      "Record",
      "Title",
      "FileLeafRef",
      "DocType",
      "FileRef",
      "Modified",
      "Editor",
      "Created",
      "Author"
    ],
    Edit: ["Record", "Title", "FileLeafRef", "DocType"]
  };
  static ListDef = {
    name: "SupportDocumentLibrary",
    title: "SupportDocumentLibrary",
    isLib: true
  };
};

// src/sal/shared/result.js
var Result = class _Result {
  constructor(value) {
    this.value = value;
  }
  value;
  error;
  get isSuccess() {
    return !this.error;
  }
  get isFailure() {
    return !this.isSuccess;
  }
  static Success(value) {
    return new _Result(value);
  }
  static Failure(error2) {
    const result = new _Result();
    result.error = error2;
  }
};

// src/sal/orm.js
var DEBUG = false;
var DbContext = class {
  constructor() {
  }
  SitePages = new EntitySet(SitePage);
  utilities = {
    copyFileAsync,
    ensurePerson
  };
  _virtualSets = /* @__PURE__ */ new Map();
  Set = (entityType) => {
    const key = entityType.ListDef.name;
    const set = Object.values(this).filter((val) => val.constructor.name == EntitySet.name).find((set2) => set2.ListDef?.name == key);
    if (set) return set;
    if (!this._virtualSets.has(key)) {
      const newSet = new EntitySet(entityType);
      this._virtualSets.set(key, newSet);
      return newSet;
    }
    return this._virtualSets.get(key);
  };
};
var EntitySet = class {
  constructor(entityType) {
    if (!entityType.ListDef) {
      console.error("Missing entityType listdef for", entityType);
      return;
    }
    this.entityType = entityType;
    try {
      const allFieldsSet = /* @__PURE__ */ new Set();
      entityType.Views?.All?.map((field) => allFieldsSet.add(field));
      const newEntity = new this.entityType();
      if (newEntity.FieldMap) {
        Object.keys(newEntity.FieldMap).map((field) => allFieldsSet.add(field));
      }
      this.AllDeclaredFields = [...allFieldsSet];
    } catch (e) {
      console.warn("Could not instantiate", entityType), console.warn(e);
      this.AllDeclaredFields = entityType.Views?.All ?? [];
    }
    this.ListDef = entityType.ListDef;
    this.Views = entityType.Views;
    this.Title = entityType.ListDef.title;
    this.Name = entityType.ListDef.name;
    this.ListRef = new SPList(entityType.ListDef);
    this.entityConstructor = this.entityType.FindInStore || this.entityType.Create || this.entityType;
  }
  // Queries
  FindById = async (id2, fields = this.AllDeclaredFields) => {
    const result = await this.ListRef.getById(id2, fields);
    if (!result) return null;
    const newEntity = new this.entityType(result);
    mapObjectToEntity(result, newEntity);
    return newEntity;
  };
  FindByTitle = async (title, fields = this.AllDeclaredFields) => {
    const result = await this.FindByColumnValue(
      [{ column: "Title", value: title }],
      {},
      {},
      fields
    );
    return result;
  };
  // TODO: Feature - Queries should return options to read e.g. toList, first, toCursor
  /**
   * Takes an array of columns and filter values with an optional comparison operator
   * @param {[{column, op?, value}]} columnFilters
   * @param {*} param1
   * @param {*} param2
   * @param {*} fields
   * @param {*} includeFolders
   * @returns
   */
  FindByColumnValue = async (columnFilters, { orderByColumn, sortAsc }, { count = null, includePermissions = false, includeFolders = false }, fields = this.AllDeclaredFields) => {
    const returnCursor = count != null;
    count = count ?? 5e3;
    const results = await this.ListRef.findByColumnValueAsync(
      columnFilters,
      { orderByColumn, sortAsc },
      { count, includePermissions, includeFolders },
      fields
    );
    let cursor = {
      _next: results._next,
      results: results.results.map((item) => {
        const newEntity = new this.entityConstructor(item);
        mapObjectToEntity(item, newEntity);
        return newEntity;
      })
    };
    if (returnCursor) {
      return cursor;
    }
    const resultObj = {
      results: cursor.results
    };
    while (cursor._next) {
      cursor = await this.LoadNextPage(cursor);
      resultObj.results = resultObj.results.concat(cursor.results);
    }
    return resultObj;
  };
  LoadNextPage = async (cursor) => {
    const results = await this.ListRef.loadNextPage(cursor);
    return {
      _next: results._next,
      results: results.results.map((item) => {
        const newEntity = new this.entityType(item);
        mapObjectToEntity(item, newEntity);
        return newEntity;
      })
    };
  };
  /**
   * Return all items in list
   */
  ToList = async (refresh = false) => {
    const fields = this.Views.All;
    const results = await this.ListRef.getListItemsAsync({ fields });
    const allItems = results.map((item) => {
      let entityToLoad = new this.entityType(item);
      mapObjectToEntity(item, entityToLoad);
      return entityToLoad;
    });
    return allItems;
  };
  LoadEntity = async function(entity, refresh = false) {
    if (!entity.ID) {
      console.error("entity missing Id", entity);
      return false;
    }
    const result = await this.ListRef.getById(
      entity.ID,
      this.AllDeclaredFields
    );
    if (!result) return null;
    mapObjectToEntity(result, entity);
    return entity;
  };
  // Mutators
  AddEntity = async function(entity, folderPath) {
    const creationfunc = mapEntityToObject.bind(this);
    const writeableEntity = creationfunc(entity, this.AllDeclaredFields);
    if (DEBUG) console.log(writeableEntity);
    const newId = await this.ListRef.createListItemAsync(
      writeableEntity,
      folderPath
    );
    mapObjectToEntity({ ID: newId }, entity);
    return Result.Success(entity);
  };
  UpdateEntity = async function(entity, fields = null) {
    const writeableEntity = mapEntityToObject.bind(this)(entity, fields);
    writeableEntity.ID = typeof entity.ID == "function" ? entity.ID() : entity.ID;
    if (DEBUG) console.log(writeableEntity);
    const result = await this.ListRef.updateListItemAsync(writeableEntity);
    return Result.Success(result);
  };
  RemoveEntity = async function(entity) {
    if (!entity.ID) return false;
    await this.ListRef.deleteListItemAsync(entity.ID);
    return true;
  };
  RemoveEntityById = function(entityId) {
    return this.ListRef.deleteListItemAsync(entityId);
  };
  // Permissions
  GetItemPermissions = function(entity) {
    return this.ListRef.getItemPermissionsAsync(entity.ID);
  };
  SetItemPermissions = async function(entity, valuePairs, reset = false) {
    return this.ListRef.setItemPermissionsAsync(entity.ID, valuePairs, reset);
  };
  GetRootPermissions = function() {
    return this.ListRef.getListPermissions();
  };
  SetRootPermissions = async function(itemPermissions, reset) {
    await this.ListRef.setListPermissionsAsync(itemPermissions, reset);
  };
  // Folder Methods
  GetFolderUrl = function(relFolderPath = "") {
    return this.ListRef.getServerRelativeFolderPath(relFolderPath);
  };
  GetItemsByFolderPath = async function(folderPath, fields = this.AllDeclaredFields) {
    const results = await this.ListRef.getFolderContentsAsync(
      folderPath,
      fields
    );
    return results.map((result) => {
      const newEntity = new this.entityType(result);
      mapObjectToEntity(result, newEntity);
      return newEntity;
    });
  };
  UpsertFolderPath = async function(folderPath) {
    return this.ListRef.upsertFolderPathAsync(folderPath);
  };
  RemoveFolderByPath = async function(folderPath) {
    const itemResults = await this.FindByColumnValue(
      [{ column: "FileLeafRef", value: folderPath }],
      {},
      {},
      ["ID", "Title", "FileLeafRef"],
      true
    );
    const entities = itemResults.results ?? [];
    for (const entity of entities) {
      await this.RemoveEntityById(entity.ID);
    }
  };
  // Permissions
  SetFolderReadOnly = async function(relFolderPath) {
    return this.ListRef.setFolderReadonlyAsync(relFolderPath);
  };
  SetFolderPermissions = async function(folderPath, valuePairs, reset = true) {
    const salValuePairs = valuePairs.filter((vp) => vp[0] && vp[1]).map((vp) => [vp[0].getKey(), vp[1]]);
    return this.ListRef.setFolderPermissionsAsync(
      folderPath,
      salValuePairs,
      reset
    );
  };
  EnsureFolderPermissions = async function(relFolderPath, valuePairs) {
    const salValuePairs = valuePairs.filter((vp) => vp[0] && vp[1]).map((vp) => [vp[0].LoginName ?? vp[0].Title, vp[1]]);
    return this.ListRef.ensureFolderPermissionsAsync(
      relFolderPath,
      salValuePairs
    );
  };
  // Other Functions
  // Upload file directly from browser "File" object e.g. from input field
  UploadFileWithEntity = async function({
    file,
    entity,
    view,
    folderPath,
    progress
  }) {
    const filename = entity.FileName.Value();
    const updates = mapEntityToObject.bind(this)(
      entity,
      view ?? this.AllDeclaredFields
    );
    const itemId = await this.ListRef.uploadFileToFolderAndUpdateMetadata(
      file,
      filename,
      folderPath,
      updates,
      progress
    );
    await this.LoadEntity(entity);
    return Result.Success(entity);
  };
  UploadFileToFolderAndUpdateMetadata = async function(file, filename, folderPath, updates, progress) {
    const itemId = await this.ListRef.uploadFileToFolderAndUpdateMetadata(
      file,
      filename,
      folderPath,
      updates,
      progress
    );
    const item = await this.ListRef.getById(itemId, this.AllDeclaredFields);
    const newEntity = new this.entityConstructor(item);
    mapObjectToEntity(item, newEntity);
    return newEntity;
  };
  // Open file upload Modal
  UploadNewDocument = async function(folderPath, args) {
    return this.ListRef.uploadNewDocumentAsync(
      folderPath,
      "Attach a New Document",
      args
    );
  };
  CopyFolderContents = async function(sourceFolder, targetFolder) {
    return this.ListRef.copyFilesAsync(sourceFolder, targetFolder);
  };
  // Form Methods
  ShowForm = async function(name, title, args) {
    return new Promise(
      (resolve, reject2) => this.ListRef.showModal(name, title, args, resolve)
    );
  };
  CheckInDocument = async function(fileRef) {
    return new Promise(
      (resolve) => this.ListRef.showCheckinModal(fileRef, resolve)
    );
  };
  EnsureList = async function() {
  };
};
function mapObjectToEntity(inputObject, targetEntity) {
  if (DEBUG)
    console.log(
      `ApplicationDBContext: ${targetEntity.constructor.name}: `,
      inputObject
    );
  if (!inputObject || !targetEntity) return;
  Object.keys(inputObject).forEach((key) => {
    mapValueToEntityProperty(key, inputObject[key], targetEntity);
  });
}
function mapValueToEntityProperty(propertyName, inputValue, targetEntity) {
  if (DEBUG)
    console.log(
      `ApplicationDBContext: ${targetEntity.constructor.name}.${propertyName} to ${inputValue}`
    );
  if (targetEntity.FieldMap && targetEntity.FieldMap[propertyName]) {
    mapObjectToViewField(inputValue, targetEntity.FieldMap[propertyName]);
    return;
  }
  if (targetEntity[propertyName] && typeof targetEntity[propertyName] == "function") {
    targetEntity[propertyName](inputValue);
    return;
  }
  targetEntity[propertyName] = inputValue;
  return;
}
function mapObjectToViewField(inVal, fieldMapping) {
  if (typeof fieldMapping == "function") {
    fieldMapping(inVal);
    return;
  }
  if (typeof fieldMapping != "object") {
    fieldMapping = inVal;
    return;
  }
  if (fieldMapping.set && typeof fieldMapping.set == "function") {
    fieldMapping.set(inVal);
    return;
  }
  if (fieldMapping.obs) {
    if (!inVal) {
      fieldMapping.obs(null);
      return;
    }
    const outVal = Array.isArray(inVal) ? inVal.map((item) => generateObject(item, fieldMapping)) : generateObject(inVal, fieldMapping);
    fieldMapping.obs(outVal);
    return;
  }
  fieldMapping = inVal;
}
function generateObject(inVal, fieldMap) {
  return fieldMap.factory ? fieldMap.factory(inVal) : inVal;
}
function mapEntityToObject(input, selectedFields = null) {
  const entity = {};
  const allWriteableFieldsSet = /* @__PURE__ */ new Set([]);
  if (this?.ListDef?.fields) {
    this.ListDef.fields.forEach((field) => allWriteableFieldsSet.add(field));
  }
  if (this?.AllDeclaredFields) {
    this.AllDeclaredFields.map((field) => allWriteableFieldsSet.add(field));
  }
  if (input.FieldMap) {
    Object.keys(input.FieldMap).forEach(
      (field) => allWriteableFieldsSet.add(field)
    );
  }
  const allWriteableFields = [...allWriteableFieldsSet];
  const fields = selectedFields ?? (input.FieldMap ? Object.keys(input.FieldMap) : null) ?? Object.keys(input);
  fields.filter((field) => allWriteableFields.includes(field)).map((field) => {
    if (input.FieldMap && input.FieldMap[field]) {
      const storedFieldKey = input.FieldMap[field].systemName ?? field;
      entity[storedFieldKey] = mapViewFieldToValue(input.FieldMap[field]);
      return;
    }
    entity[field] = input[field];
  });
  return entity;
}
function mapViewFieldToValue(fieldMap) {
  if (typeof fieldMap == "function") {
    return fieldMap();
  }
  if (fieldMap.get && typeof fieldMap.get == "function") {
    return fieldMap.get();
  }
  if (fieldMap.obs) {
    return fieldMap.obs();
  }
  return fieldMap;
}

// src/infrastructure/app-db-context.js
var ApplicationDbContext = class extends DbContext {
  constructor() {
    super();
  }
  Actions = new EntitySet(Action);
  BusinessOffices = new EntitySet(BusinessOffice);
  Notifications = new EntitySet(Notification);
  Plans = new EntitySet(Plan);
  RecordSources = new EntitySet(RecordSource);
  Rejections = new EntitySet(Rejection);
  RootCauseWhys = new EntitySet(RootCauseWhy);
  SupportingDocuments = new EntitySet(SupportingDocument);
};
var appContext = new ApplicationDbContext();

// src/sal/components/modal/ModalDialogTemplate.js
var modalDialogTemplate = html2`
  <dialog
    id=""
    class="draggable sal-modal-dialog"
    data-bind="attr: {id: getUniqueId() }"
  >
    <!-- Can't use 'with: currentDialog' since we need to register our 
      javascript event listeners for grabbing and resizing -->
    <div class="modal-dialog-header grabber">
      <h2 class="modal-dialog-title" data-bind="text: title"></h2>
      <h2 class="modal-dialog-title">
        <i class="fa-solid fa-xmark pointer" data-bind="click: clickClose"></i>
      </h2>
    </div>
    <div class="dimmer" data-bind="css: {'active': form.saving }">
      <span class="loader"></span>
      <ul class="" data-bind="foreach: $root.blockingTasks">
        <li data-bind="text: msg + '...'"></li>
      </ul>
    </div>
    <div
      class="modal-dialog-body"
      data-bind="component: { name: form.componentName, params: form.params }"
    ></div>
    <div class="modal-dialog-actions">
      <button
        style
        type="button"
        class="btn btn-danger"
        data-bind="click: clickClose"
      >
        Cancel
      </button>
    </div>
  </dialog>

  <style>
    .sal-modal-dialog {
      display: none;
      position: absolute;
      z-index: 15;
      width: 615px;
      min-width: 400px;
      max-height: 85vh;
      padding: 0;
      margin: 0;
      top: 125px;
      resize: both;

      border: 2px solid var(--primary-color);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
    }

    .sal-modal-dialog.active {
      display: flex;
    }

    .sal-modal-dialog .modal-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* background-color: inherit; */
      /* position: sticky;
      top: 0; */
      padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    }

    .sal-modal-dialog .modal-dialog-title {
      color: inherit;
      margin: 0;
    }

    .sal-modal-dialog .modal-dialog-body {
      padding: 0.5rem 1.5rem;
      overflow: auto;
    }

    .sal-modal-dialog .modal-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: auto;
      padding: 0.5rem 1.5rem 1.5rem 1.5rem;
    }

    .draggable {
      position: absolute;
    }

    .draggable .grabber {
      cursor: move;
    }
  </style>
`;

// src/sal/components/modal/modalDialog.js
var componentName = "modal-dialog-component";
var currentDialogs = ko.observableArray();
var toggle;
function showModalDialog(dialogOptions) {
  currentDialogs.push(dialogOptions);
}
var ModalDialogModule = class {
  constructor(dialogOpts) {
    this.dialogOpts = dialogOpts;
    this.title = dialogOpts.title;
    this.dialogReturnValueCallback = dialogOpts.dialogReturnValueCallback;
    this.form = dialogOpts.form;
    if (this.form?.onComplete) {
      alert("Pass the form onComplete to the modal dialog!");
      return;
    }
    this.form.onComplete = this.close.bind(this);
    toggle = this.toggle;
  }
  toggle = (show = null) => {
    if (show == null) show = !this.dlgElement.hasAttribute("open");
    show ? this.showModal() : this.hide();
  };
  showModal = () => {
    this.dlgElement.showModal();
    this.dlgElement.classList.add("active");
  };
  clickClose = () => {
    this.close(false);
  };
  hide = () => {
    this.dlgElement.close();
    this.dlgElement.classList.remove("active");
  };
  close(result) {
    this.dlgElement.close();
    this.dlgElement.classList.remove("active");
    if (this.dialogReturnValueCallback) this.dialogReturnValueCallback(result);
    currentDialogs.remove(this.dialogOpts);
  }
  _id;
  getUniqueId = () => {
    if (!this._id) {
      this._id = "field-" + Math.floor(Math.random() * 1e4);
    }
    return this._id;
  };
  koDescendantsComplete = function(node) {
    this.dlgElement = node.querySelector("dialog");
    dragElement(this.dlgElement);
    resizeDialog(this.dlgElement);
    this.showModal();
  };
};
directRegisterComponent(componentName, {
  template: modalDialogTemplate,
  viewModel: ModalDialogModule
});
function resizeDialog(elmnt) {
  elmnt.style.width = "550px";
  elmnt.style.height = "";
  elmnt.style.top = "125px";
  elmnt.style.left = (window.GetViewportWidth() - 550) / 2 + "px";
}
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const dragger = elmnt.querySelector(".grabber");
  if (dragger) {
    dragger.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// src/sal/components/forms/baseForm.js
var html4 = String.raw;
var BaseForm = class {
  constructor({ entity = null, view = null }) {
    this.entity = entity;
    this.view = view ?? entity.constructor.Views.All;
  }
  saving = ko.observable(false);
  FormFields = ko.pureComputed(() => {
    const entity = ko.utils.unwrapObservable(this.entity);
    return Object.entries(entity.FieldMap).filter(([key, field]) => this.view.includes(key) && field?.Visible()).map(([key, field]) => field);
  });
  // Validate just the fields on this form
  validate = (showErrors = true) => {
    Object.values(this.FormFields()).map(
      (field) => field?.validate && field.validate(showErrors)
    );
    this.ShowErrors(showErrors);
    return this.Errors();
  };
  ShowErrors = ko.observable(false);
  Errors = ko.pureComputed(() => {
    return Object.values(this.FormFields()).filter((field) => field?.Errors && field.Errors()).flatMap((field) => field.Errors());
  });
  IsValid = ko.pureComputed(() => !this.Errors().length);
  params = this;
};

// src/sal/enums/display_modes.js
var FormDisplayModes = {
  new: "new",
  edit: "edit",
  view: "view"
};
var FieldDisplayModes = {
  new: "new",
  edit: "edit",
  view: "view"
};

// src/sal/components/forms/default/defaultForm.js
var componentName2 = "default-constrained-entity-form";
var DefaultForm = class extends BaseForm {
  constructor({ entity, view, displayMode, onSubmit }) {
    super({ entity, view });
    this.displayMode(displayMode);
    if (onSubmit) this._submitAction = onSubmit;
  }
  // Default submit action:
  // Add, Edit based on displayMode
  _submitAction = () => {
    const entity = ko.unwrap(this.entity);
    const entitySet = appContext.Set(entity.constructor);
    if (!entitySet)
      return Result.Failure(
        new DomainError({
          source: "default-form",
          entity,
          description: "Could not find entityset"
        })
      );
    const displayMode = ko.unwrap(this.displayMode);
    const view = ko.unwrap(this.view);
    switch (displayMode) {
      case FormDisplayModes.new:
        return entitySet.AddEntity(entity);
      case FormDisplayModes.edit:
        return entitySet.UpdateEntity(entity, view);
    }
    return Result.Success("Nothing to do");
  };
  displayMode = ko.observable();
  showSubmitButton = ko.pureComputed(() => {
    return this._submitAction && ko.unwrap(this.displayMode) !== FormDisplayModes.view;
  });
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
      const result = await this._submitAction(entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result?.error);
    } catch (e) {
      alert(e);
    }
  }
  clickCancel() {
  }
  clickClear() {
  }
  params = this;
  componentName = componentName2;
};
var template = html4`
  <div class="app-form">
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
            name: components[$parent.displayMode()], params: $data}, 
            class: classList"
      ></div>
    </div>
    <div class="form-actions">
      <!-- ko if: showSubmitButton -->
      <button
        type="button"
        class="btn btn-success"
        data-bind="click: clickSubmit"
      >
        Submit
      </button>
      <!-- /ko -->
    </div>
  </div>
`;
ko.components.register(componentName2, {
  template
});

// src/sal/components/forms/default/defaultUploadForm.js
var componentName3 = "default-upload-constrained-entity-form";
function getFileTitle(filename) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return filename;
  }
  return filename.substring(0, lastDotIndex);
}
var DefaultUploadForm = class extends BaseForm {
  constructor({ entity, view, folderPath }) {
    super({ entity, view });
    this.displayMode(FormDisplayModes.new);
    this.folderPath = folderPath;
    this.files.subscribeAdded(this.onFileAttachedHandler);
  }
  files = ko.observableArray();
  file = ko.observable();
  onFileAttachedHandler = async (newFiles) => {
    if (!newFiles.length) return;
    const newFile = newFiles[0];
    this.file(newFile);
    const entity = ko.unwrap(this.entity);
    entity.FileName.Value(newFile.name);
    entity.Title.Value(getFileTitle(newFile.name));
  };
  // Default submit action:
  // Add, Edit based on displayMode
  _submitAction = () => {
    const entity = ko.unwrap(this.entity);
    const entitySet = appContext.Set(entity.constructor);
    if (!entitySet)
      return Result.Failure(
        new DomainError({
          source: "default-form",
          entity,
          description: "Could not find entityset"
        })
      );
    const file = ko.unwrap(this.file);
    const folderPath = ko.unwrap(this.folderPath);
    const view = ko.unwrap(this.view);
    return entitySet.UploadFileWithEntity({
      file,
      entity,
      folderPath,
      view
    });
  };
  displayMode = ko.observable();
  showSubmitButton = ko.pureComputed(() => {
    return this._submitAction && ko.unwrap(this.displayMode) !== FormDisplayModes.view;
  });
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
      const result = await this._submitAction(entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result?.error);
    } catch (e) {
      alert(e);
    }
  }
  clickCancel() {
  }
  clickClear() {
  }
  params = this;
  componentName = componentName3;
};
var template2 = html4`
  <div class="app-form">
    <div class="form-fields vertical">
      <label class="file-upload-field">
        Upload Documents:
        <div class="dropzone" data-bind="">Drop Files Here</div>
        <input class="file-upload" type="file" data-bind="files: files" />
      </label>
    </div>
    <!-- ko if: file -->
    <div class="form-fields vertical" data-bind="foreach: FormFields">
      <div
        class="form-field-component"
        data-bind="component: {
            name: components[$parent.displayMode()], params: $data}, 
            class: classList"
      ></div>
    </div>
    <!-- /ko -->
    <div class="form-actions">
      <!-- ko if: showSubmitButton -->
      <button
        type="button"
        class="btn btn-success"
        data-bind="click: clickSubmit"
      >
        Submit
      </button>
      <!-- /ko -->
    </div>
  </div>
`;
ko.components.register(componentName3, {
  template: template2
});

// src/sal/infrastructure/form_manager.js
function NewForm({ entity, view = null, onSubmit }) {
  return new DefaultForm({
    entity,
    view,
    onSubmit,
    displayMode: FieldDisplayModes.new
  });
}
function EditForm({ entity, view = null, onSubmit }) {
  return new DefaultForm({
    entity,
    view,
    onSubmit,
    displayMode: FieldDisplayModes.edit
  });
}
function DispForm({ entity, view = null }) {
  return new DefaultForm({ entity, view, displayMode: FieldDisplayModes.view });
}
function UploadForm({ entity, view = null, folderPath }) {
  return new DefaultUploadForm({ entity, view, folderPath });
}

// src/notification-templates/pending-problem-approval.js
var html5 = String.raw;
function pendingProblemApprovalTemplate(plan) {
  const recordType = plan.RecordType.Value();
  const problemDescription = plan.ProblemDescription.Value();
  const template6 = html5`
    <p>
      A ${recordType} has been submitted to address the following nonconformity
      and requires approval:
    </p>
    <p>${problemDescription}</p>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}.
    </p>
  `;
  return template6;
}

// src/services/authorization.js
var currentRole = ko.observable();
var userRoleOpts = ko.pureComputed(() => {
  const roles = [SITEROLEGROUPS.USER];
  if (currentUser.isInGroupTitle(SITEROLEGROUPS.QTM.GROUPNAME)) {
    roles.push(SITEROLEGROUPS.QOS);
    roles.push(SITEROLEGROUPS.QTMB);
    roles.push(SITEROLEGROUPS.QTM);
    return roles;
  }
  if (currentUser.isInGroupTitle(SITEROLEGROUPS.QOS.GROUPNAME) || currentUser.isInGroupTitle(SITEROLEGROUPS.QOSTEMP.GROUPNAME)) {
    roles.push(SITEROLEGROUPS.QOS);
  }
  if (currentUser.isInGroupTitle(SITEROLEGROUPS.QTMB.GROUPNAME)) {
    roles.push(SITEROLEGROUPS.QTMB);
  }
  return roles;
});
var User = class _User extends People2 {
  constructor({
    ID,
    Title,
    LoginName = null,
    LookupValue = null,
    WorkPhone = null,
    EMail = null,
    IsGroup = null,
    IsEnsured = false,
    Groups = null
  }) {
    super({ ID, Title, LookupValue, LoginName, IsGroup, IsEnsured });
    this.WorkPhone = WorkPhone;
    this.EMail = EMail;
    this.Groups = Groups;
  }
  Groups = [];
  isInGroup(group) {
    if (!group?.ID) return false;
    return this.getGroupIds().includes(group.ID);
  }
  isInGroupTitle(groupTitle) {
    return this.Groups.find((group) => group.Title == groupTitle);
  }
  getGroupIds() {
    return this.Groups.map((group) => group.ID);
  }
  IsSiteOwner = ko.pureComputed(
    () => this.isInGroup(getDefaultGroups().owners)
  );
  hasSystemRole = (systemRole) => {
    const userIsOwner = this.IsSiteOwner();
    switch (systemRole) {
      case systemRoles.Admin:
        return userIsOwner;
        break;
      case systemRoles.ActionOffice:
        return userIsOwner || this.ActionOffices().length;
      default:
    }
  };
  static _user = null;
  static Create = async function() {
    if (_User._user) return _User._user;
    const userProps = await getUserPropsAsync();
    _User._user = new _User(userProps);
    return _User._user;
  };
};
var currentUser = await User.Create();

// src/services/plan-service.js
function getRoleLinkToPlan(plan, role = null) {
  return `${_spPageContextInfo.webAbsoluteUrl}/?capid=${plan.Title.Value()}&tab=detail${role ? `&role=${role}` : ""}`;
}
function getAnchorRoleLinkToPlan(plan, role = null) {
  const link = getRoleLinkToPlan(plan, role);
  return html3`<a href="${link}" target="blank">${plan.Title.Value()}</a>`;
}
async function addNewPlan(plan) {
  console.log("inserting plan", plan);
  const planType = ko.unwrap(plan.RecordType.Value);
  if (!planType) {
    return Result.Error(PlanErrors.recordTypeNotSetError);
  }
  let result;
  if (plan.isCAR() && !plan.isSelfInitiated()) {
    const loc2 = ko.unwrap(plan.CGFSLocation.Value);
    if (loc2 == LOCATION.BANGKOK) {
      plan.ProcessStage.Value(stageDescriptions.ProblemApprovalQTMB.stage);
    } else {
      plan.ProcessStage.Value(stageDescriptions.ProblemApprovalQTM.stage);
    }
  }
  if (plan.isCAP()) {
    plan.SelfInitiated.Value("Yes");
  }
  if (plan.isSelfInitiated()) {
    plan.ProcessStage.Value(stageDescriptions.DevelopingActionPlan.stage);
    const today = /* @__PURE__ */ new Date();
    const target_deadline = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 30
    );
    plan.NextTargetDate.set(target_deadline);
    const user = currentUser;
    plan.ProblemResolverName.set(user);
    plan.SubmittedDate.Value(/* @__PURE__ */ new Date());
  }
  plan.flatten();
  plan.AuthorName.Value(currentUser.Title);
  plan.Active.Value(true);
  return appContext.Plans.AddEntity(plan);
}
async function editPlan(plan, view) {
  plan.flatten();
  return appContext.Plans.UpdateEntity(plan, view);
}
async function cancelPlan(plan) {
  const userRole = ko.unwrap(currentRole);
  plan.PreviousStage.Value(plan.ProcessStage.toString());
  let nextStage = userRole == ROLES.ADMINTYPE.USER ? stageDescriptions.ClosedRecalled.stage : stageDescriptions.ClosedRejected.stage;
  plan.ProcessStage.Value(nextStage);
  plan.CloseDate.Value(/* @__PURE__ */ new Date());
  plan.Active.Value(false);
  return appContext.Plans.UpdateEntity(plan, Plan.Views.CancelSubmit);
}
var PlanErrors = {
  recordTypeNotSetError: new ValidationError2(
    "add-new-plan",
    "required-field",
    "Plan type is not set!"
  )
};

// src/notification-templates/developing-action-plan.js
function developingActionPlanTemplate(plan) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  const isSelfInitiated = plan.SelfInitiated.Value() == "Yes";
  if (isSelfInitiated) {
    return html3`
      <p>The following noncomformity has been assigned:</p>
      <ul>
        <li>Record: ${title}</li>
        <li>Location: ${location2}</li>
      </ul>
      <p>Please visit the link below to view the noncomformity.</p>
    `;
  }
  return html3`
    <p>The following noncomformity has been assigned:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      You are receiving this email because your QSO has assigned you as the
      responsible party for resolving this ${recordType}.
    </p>
    <p>
      Please visit the link below to view the noncomformity and develop an
      action plan.
    </p>
  `;
}
function developingActionPlanRejectedTemplate(plan, rejection) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  const rejectionReason = rejection.Reason.Value();
  return html3`
    <p>The following plan has been <span style="color: red">rejected</span>:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Rejection Reason:<br />
      ${rejectionReason}
    </p>
    <p>
      You are receiving this email because you are designated as the responsible
      party for resolving this ${recordType}.
    </p>
    <p>
      Please visit the link below to view the noncomformity and revise the
      action plan.
    </p>
  `;
}

// src/notification-templates/pending-plan-approval.js
function pendingPlanApprovalTemplate(plan, role) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, role);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>
      An action plan has been submitted to address the following noncomformity:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}.
    </p>
  `;
}

// src/notification-templates/implementing-action-plan.js
function implementingActionPlanTemplate(plan) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>The following action plan has been approved:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      You are receiving this email because you have been designated as an action
      plan responsible person.
    </p>
    <p>Please visit the CAP/CAR tool to view and complete your actions.</p>
  `;
}

// src/notification-templates/pending-implementation-approval.js
function pendingImplementationApproval(plan, role) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, role);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>
      An action plan has been implemented to address the following
      noncomformity:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}’s
      implementation.
    </p>
  `;
}

// src/notification-templates/pending-effectiveness-submission.js
function pendingEffectivenessSubmissionTemplate(plan) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>The following ${recordType}’s implementation has been approved:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      When ready, please submit proof of effectiveness by navigating to the link
      below.
    </p>
    <p>
      For guidance, refer to GFS-RD-QMS-0503 Guidance for CAR/CAP Stage 4 -
      Verification of Effectiveness (<a
        href="http://kbi.cgfs.state.sbu/article.aspx?article=39561&p=28"
        target="_blank"
      >
        KB #39561</a
      >)
    </p>
  `;
}
function pendingEffectivenessSubmissionRejectedTemplate(plan, rejection) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>
      The following ${recordType}’s implementation has been
      <span style="color: red;">rejected</span>:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Rejection Reason:<br />
      ${rejection.Reason.Value()}
    </p>
    <p>
      When ready, please update proof of effectiveness by navigating to the link
      below.
    </p>
    <p>
      For guidance, refer to GFS-RD-QMS-0503 Guidance for CAR/CAP Stage 4 -
      Verification of Effectiveness (<a
        href="http://kbi.cgfs.state.sbu/article.aspx?article=39561&p=28"
        target="_blank"
      >
        KB #39561</a
      >)
    </p>
  `;
}

// src/notification-templates/pending-effectiveness-approval.js
function pendingEffectivenessApprovalTemplate(plan, role) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, role);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();
  return html3`
    <p>
      Proof of effectiveness has been submitted for the following ${recordType}:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}’s
      effectiveness.
    </p>
    <p>
      For guidance, refer to GFS-RD-QMS-0503 Guidance for CAR/CAP Stage 4 -
      Verification of Effectiveness (<a
        href="http://kbi.cgfs.state.sbu/article.aspx?article=39561&p=28"
        target="_blank"
      >
        KB #39561</a
      >)
    </p>
  `;
}

// src/notification-templates/actions-templates.js
function actionRequiresQsoApprovalTemplate(plan, action) {
  const location2 = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  const recordType = ko.unwrap(plan.RecordType.Value);
  const responsiblePerson = plan.CoordinatorName.Value();
  const qso = ko.unwrap(plan.QSO.Value);
  return html3`
    <p>
      Action
      <span style="font-weight: bold;"
        >${ko.unwrap(action.ActionID.Value)}</span
      >
      on the following ${recordType} has been edited and requires the QSO's
      approval.
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location2}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
      <li>QSO: ${qso.Title}</li>
    </ul>
    <p>Please visit the following link to Approve or Reject this Action.</p>
  `;
}

// src/value-objects/task.js
var taskStates = {
  pending: "Pending",
  aging: "Aging",
  completed: "Completed"
};
var TaskDef = class {
  constructor(msg, blocking = false, type = null) {
    this.msg = msg;
    this.blocking = blocking;
    this.type = type;
  }
  msg;
  blocking;
  type;
};
var Task = class {
  constructor({ msg, blocking = false }) {
    this.msg = msg;
    this.blocking = blocking;
    this.Status(taskStates.pending);
  }
  msg;
  blocking;
  Status = ko.observable();
  timeout = window.setTimeout(() => {
    console.warn("this task is aging:", this);
    this.Status(taskStates.aging);
  }, 5e3);
  markComplete = () => {
    window.clearTimeout(this.timeout);
    this.Status(taskStates.completed);
  };
  // Should this task block user input?
  IsBlocking = ko.pureComputed(
    () => this.blocking && this.Status() != taskStates.completed
  );
};

// src/services/tasks-service.js
var tasks = {
  init: new Task({ msg: "Initializing the Application" }),
  save: new Task({ msg: "Saving Plan...", blocking: true }),
  cancelAction: new Task({ msg: "Cancelling Action..." }),
  view: new Task({ msg: "Viewing Plan..." }),
  refresh: new Task({ msg: "Refreshing Plan..." }),
  lock: new Task({ msg: "Locking Plan...", blocking: true }),
  closing: new Task({ msg: "Closing Plan...", blocking: true }),
  opening: new Task({ msg: "Re-Opening Plan...", blocking: true }),
  pipeline: new Task({ msg: "Progressing to Next Stage...", blocking: true }),
  refreshPlans: new Task({ msg: "Refreshing Data..." }),
  newComment: new Task({ msg: "Refreshing Comments..." }),
  newAction: new Task({ msg: "Refreshing Actions...", blocking: true }),
  approve: new Task({ msg: "Approving Plan...", blocking: true }),
  reject: (planTitle) => new TaskDef(`Rejecting ${planTitle}`, true),
  notification: () => new TaskDef("Sending Notification", true)
};
var runningTasks = ko.observableArray();
var blockingTasks = ko.pureComputed(() => {
  return runningTasks().filter((task) => task.IsBlocking()) ?? [];
});
var addTask = (taskDef) => {
  let newTask;
  if (taskDef.constructor == Task) {
    newTask = taskDef;
  } else {
    if (taskDef.type) {
      newTask = taskDef.type.Create(taskDef);
    } else {
      newTask = new Task(taskDef);
    }
  }
  runningTasks.push(newTask);
  return newTask;
};
var finishTask = function(activeTask) {
  if (activeTask) {
    activeTask.markComplete();
    window.setTimeout(() => removeTask(activeTask), 3e3);
  }
};
var removeTask = function(taskToRemove) {
  runningTasks.remove(taskToRemove);
};

// src/services/notifications-service.js
var defaultContact = {
  QTM: "CGFSQMSCARCAP@state.gov",
  QTMB: "CGFSQMSBCARCAP@state.gov"
};
var approvedStageNotificationMap = {
  "Pending QTM-B Problem Approval": pendingQtmbProblemApproval,
  "Pending QTM Problem Approval": pendingQtmProblemApproval,
  "Pending QSO Problem Approval": pendingQsoProblemApproval,
  "Pending QAO Problem Approval": pendingQaoProblemApproval,
  "Developing Action Plan": developingActionPlan,
  "Pending QSO Plan Approval": pendingQsoPlanApproval,
  "Pending QTM-B Plan Approval": pendingQtmbPlanApproval,
  "Pending QTM Plan Approval": pendingQtmPlanApproval,
  "Implementing Action Plan": implementingActionPlan,
  "Pending QSO Implementation Approval": pendingQsoImplementationApproval,
  "Pending Effectiveness Submission": pendingEffectivenessSubmission,
  "Pending QSO Effectiveness Approval": pendingQsoEffectivenessApproval,
  "Pending QTM-B Effectiveness Approval": pendingQtmbEffectivenessApproval,
  "Pending QTM Effectiveness Approval": pendingQtmEffectivenessApproval
};
function getRejectedNotificationByStage(stage, plan, rejection) {
  switch (stage) {
    case stageDescriptions.DevelopingActionPlan.stage:
      return developingActionPlanRejected(plan, rejection);
    case stageDescriptions.ImplementingActionPlan.stage:
      return implementingActionPlanRejected(plan, rejection);
    case stageDescriptions.EffectivenessSubmissionRejected.stage:
      return pendingEffectivenessSubmissionRejected(plan, rejection);
  }
}
function subjectTemplate(plan, content = null) {
  content = content ?? plan.ProcessStage.toString();
  return `QMS-CAR/CAP - ${content} - ${plan.Title.Value()}`;
}
async function getEmailFromField(field) {
  const person = ko.unwrap(field.Value);
  const result = await appContext.utilities.ensurePerson(person);
  return result?.Email;
}
function getQsoEmail(plan) {
  return getEmailFromField(plan.QSO);
}
function getQaoEmail(plan) {
  return getEmailFromField(plan.QAO);
}
function getCoordinatorEmail(plan) {
  return getEmailFromField(plan.ProblemResolverName);
}
async function pendingQtmbProblemApproval(plan) {
  const to = [defaultContact.QTMB];
  const subject = subjectTemplate(plan, "Pending QTM-B Problem Approval");
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTMB);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQtmProblemApproval(plan) {
  const to = [defaultContact.QTM];
  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTM);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQsoProblemApproval(plan) {
  const qo = await getQsoEmail(plan);
  if (!qo) return;
  const to = [qo];
  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQaoProblemApproval(plan) {
  const qo = await getQaoEmail(plan);
  if (!qo) return;
  const to = [qo];
  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function developingActionPlan(plan) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];
  const subject = subjectTemplate(plan);
  let body = developingActionPlanTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function developingActionPlanRejected(plan, rejection) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];
  const subject = subjectTemplate(plan, "Action Plan Rejected");
  let body = developingActionPlanRejectedTemplate(plan, rejection);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQsoPlanApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];
  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES2.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
function pendingQtmbPlanApproval(plan) {
  const to = [defaultContact.QTMB];
  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES2.ADMINTYPE.QTMB);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTMB);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
function pendingQtmPlanApproval(plan) {
  const to = [defaultContact.QTM];
  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES2.ADMINTYPE.QTM);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTM);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function implementingActionPlan(plan) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const actionsResult = await appContext.Actions.FindByTitle(
    plan.Title.Value()
  );
  if (!actionsResult?.results) return;
  const actionTakerEmails = new Set(
    await Promise.all(
      actionsResult.results.map(
        (action) => getEmailFromField(action.ActionResponsiblePerson)
      )
    )
  );
  actionTakerEmails.delete(null);
  const to = [...actionTakerEmails, coordinatorEmail];
  const subject = subjectTemplate(plan);
  let body = implementingActionPlanTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function implementingActionPlanRejected(plan, rejection) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];
  const subject = subjectTemplate(plan, "Plan Implementation Rejected");
  let body = implementingActionPlanTemplate(plan, rejection);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQsoImplementationApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];
  const subject = subjectTemplate(plan);
  let body = pendingImplementationApproval(plan, ROLES2.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingEffectivenessSubmission(plan) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];
  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessSubmissionTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingEffectivenessSubmissionRejected(plan, rejection) {
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];
  const subject = subjectTemplate(plan, "Effectiveness Rejected");
  let body = pendingEffectivenessSubmissionRejectedTemplate(plan, rejection);
  body += getAnchorRoleLinkToPlan(plan);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function pendingQsoEffectivenessApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];
  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES2.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
function pendingQtmbEffectivenessApproval(plan) {
  const to = [defaultContact.QTMB];
  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES2.ADMINTYPE.QTMB);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTMB);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
function pendingQtmEffectivenessApproval(plan) {
  const to = [defaultContact.QTM];
  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES2.ADMINTYPE.QTM);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QTM);
  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
}
async function stageApprovedNotification(plan, newStage = null) {
  newStage = newStage ?? plan.ProcessStage.Value();
  const notificationFunction = approvedStageNotificationMap[newStage];
  if (!notificationFunction) return;
  const notificationTask = addTask(tasks.notification());
  const notification = await notificationFunction(plan);
  await sendPlanNotification(plan, notification);
  finishTask(notificationTask);
}
async function stageRejectedNotification(plan, rejection) {
  const newStage = plan.ProcessStage.Value();
  const notificationPromise = getRejectedNotificationByStage(
    newStage,
    plan,
    rejection
  );
  if (!notificationPromise) {
    return;
  }
  const notificationTask = addTask(tasks.notification());
  const notification = await notificationPromise;
  await sendPlanNotification(plan, notification);
  finishTask(notificationTask);
}
async function actionRequiresApprovalNotification(plan, action) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];
  const subject = subjectTemplate(plan, "Action Requires Approval");
  let body = actionRequiresQsoApprovalTemplate(plan, action);
  body += getAnchorRoleLinkToPlan(plan, ROLES2.ADMINTYPE.QO);
  const notification = Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body
  });
  return sendPlanNotification(plan, notification);
}
async function sendPlanNotification(plan, notification) {
  if (!notification) return;
  const folderPath = plan.Title.Value();
  await appContext.Notifications.UpsertFolderPath(folderPath);
  const result = await appContext.Notifications.AddEntity(
    notification,
    folderPath
  );
  return result;
}

// src/services/actions-service.js
function getNextActionId(planId, actions) {
  let actionNoMax = 1;
  actions.forEach((action) => {
    let actionNo = parseInt(action.ActionID.split("-")[2].split("A")[1]);
    if (actionNo >= actionNoMax) {
      actionNoMax = actionNo + 1;
    }
  });
  const actionCountPadded = actionNoMax.toString().padStart(2, "0");
  return `${planId}-A${actionCountPadded}`;
}
async function submitNewAction(plan, action) {
  console.log("submitting action: " + action.ActionID.Value(), action);
  action.ImplementationStatus.Value(ACTIONSTATES.PLANAPPROVAL);
  action.RevisionCount.Value(0);
  return appContext.Actions.AddEntity(action);
}
async function editAction(plan, action) {
  const planStage = ko.unwrap(plan.ProcessStage.Value);
  const actionStatus = ko.unwrap(action.ImplementationStatus.Value);
  const planNotApproved = [
    stageDescriptions.DevelopingActionPlan.stage,
    stageDescriptions.PlanApprovalQSO.stage
  ].includes(planStage);
  if (planNotApproved || actionStatus == ACTIONSTATES.QSOAPPROVAL) {
    return appContext.Actions.UpdateEntity(action, Action.Views.Edit);
  }
  let revisions = action.RevisionCount.Value() ?? 0;
  action.RevisionCount.Value(++revisions);
  action.ImplementationStatus.Value(ACTIONSTATES.QSOAPPROVAL);
  const result = await appContext.Actions.UpdateEntity(
    action,
    Action.Views.EditApproval
  );
  if (result.isFailure) return result;
  return actionRequiresApprovalNotification(plan, action);
}

// src/forms/actions/edit/edit-action-form.js
var componentName4 = "edit-action-form";
var EditActionForm = class extends BaseForm {
  constructor({ entity, plan, view, onComplete }) {
    super({ entity, view });
    this.onComplete = onComplete;
    this._plan = plan;
    const action = ko.unwrap(entity);
    action.PreviousActionDescription.set(action.ActionDescription.get());
    action.PreviousTargetDate.set(action.TargetDate.get());
    action.PreviousActionResponsiblePerson.set(
      action.ActionResponsiblePerson.get()
    );
  }
  showStageWarning = ko.pureComputed(() => {
    const stage = ko.unwrap(this._plan.ProcessStage.Value);
    return !["Developing Action Plan", "Pending QSO Plan Approval"].includes(
      stage
    );
  });
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
      const result = await editAction(this._plan, entity);
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
      else alert(result.error);
    } catch (e) {
      alert(e);
    }
  }
  params = this;
  componentName = componentName4;
};
var template3 = html2`
  <div class="app-form">
    <!-- ko if: showStageWarning -->
    <div class="alert alert-warning fw-bold">
      Editing this action will require re-approval by the QSO.
    </div>
    <!-- /ko -->
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
        Submit
      </button>
    </div>
  </div>
`;
directRegisterComponent(componentName4, {
  template: template3
});

// src/forms/plan/new/new-plan-form.js
var componentName5 = "new-plan-form";
var NewPlanForm = class extends BaseForm {
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
    const location2 = ko.unwrap(entity.CGFSLocation.Value);
    if (!office || !location2) return;
    entity.QAO.set(office.QAO.get());
    entity.QSO.set(office.getQSOByLocation(location2)?.get());
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
      if (result?.isSuccess) this.onComplete(SP.UI.DialogResult.OK);
    } catch (e) {
      alert(e);
    }
  }
  params = this;
  componentName = componentName5;
};
var template4 = html2`
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
directRegisterComponent(componentName5, {
  template: template4
});

// src/forms/plan/cancel/cancel-plan-form.js
var componentName6 = "cancel-plan-form";
var CancelPlanForm = class extends BaseForm {
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
  componentName = componentName6;
  params = this;
};
var template5 = html4`
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
directRegisterComponent(componentName6, { template: template5 });

// src/components/print/print.js
var html6 = String.raw;
async function printPlan(planId) {
  const plan = await appContext.Plans.FindById(planId);
  const linkToPlan = getRoleLinkToPlan(plan);
  const planTitle = plan.Title.toString();
  const docsResult = await appContext.SupportingDocuments.FindByColumnValue(
    [`substringof('${planTitle}', FileRef)`],
    {},
    {}
  );
  const docs = docsResult.results;
  const supportDocs = docs.filter(
    (doc) => doc.DocType.Value() == SUPPORTINGDOCUMENTTYPES.SUPPORT
  );
  const effectivenessDocs = docs.filter(
    (doc) => doc.DocType.Value() == SUPPORTINGDOCUMENTTYPES.EFFECTIVENESS
  );
  const actionsResult = await appContext.Actions.FindByTitle(planTitle);
  const actions = actionsResult.results;
  let recordTypeBody = "";
  if (plan.isCAP()) {
    recordTypeBody = capBodyTemplate({ plan });
  } else {
    const whysResult = await appContext.RootCauseWhys.FindByColumnValue(
      [`substringof('${planTitle}', Title)`],
      {},
      {}
    );
    const whys = whysResult.results ?? [];
    recordTypeBody = carBodyTemplate({ plan, whys });
  }
  const template6 = printTemplate({
    plan,
    recordTypeBody,
    supportDocs,
    effectivenessDocs,
    actions,
    linkToPlan
  });
  const printPage = window.open("", "Print Page");
  printPage.document.open();
  printPage.document.write(template6);
  printPage.document.close();
  printPage.print();
}
var printTemplate = ({
  plan,
  recordTypeBody,
  supportDocs,
  effectivenessDocs,
  actions,
  linkToPlan
}) => html6` <html>
  <head>
    <title>${plan.Title.toString()}</title>
  </head>
  <!--
  <link
    rel="stylesheet"
    type="text/css"
    href="/sites/CGFS-QMS/Style Library/apps/qms-ci/dist/styles.css"
  />
  -->
  <style>
    .report table,
    .report th,
    .report td {
      border-collapse: collapse;
      border: 1px solid black;
      padding: 3px 7px;
      font-family: "Segoe UI", Segoe, Tahom;
      font-size: 0.9rem;
    }

    .report th {
      font-weight: 500;
    }

    .app.report {
      font-family: "Segoe UI", Segoe, Tahom;
      font-size: 0.9rem;
    }

    .section {
      margin-block-end: 1.5em;
      break
    }

    .subsection {
      break-inside: avoid;
      margin-block-end: 1em;
    }

    h1.section-title {
      font-size: 1.3rem;
    }

    .section-title {
      padding: 0;
      margin: 0;
      font-size: 1.3em;
      font-weight: 600;
    }

    .section-subtitle {
      padding: 0;
      margin: 0.2em 0;
      font-size: 1em;
      font-weight: 600;
    }

    .plan-link {
      font-size: .9em;
    }

    .nowrap {
      white-space: nowrap;
    }
  </style>
  <div class="app report">
    <h1 class="section-title">
      ${plan.Title.toString()} - ${plan.Subject.toString()}
    </h1>
    <div class="section">
      <span class="plan-link">[${linkToPlan}]</span>
      <table>
        <tbody>
          <tr>
            <td>Record ID:</td>
            <td>${plan.Title.toString()}</td>
          </tr>
          <tr>
            <td>Type:</td>
            <td>${plan.RecordType.toString()}</td>
          </tr>
          <tr>
            <td>Subject:</td>
            <td>${plan.Subject.toString()}</td>
          </tr>
          <tr>
            <td>Business Office:</td>
            <td>${plan.BusinessOffice.toString()}</td>
          </tr>
          <tr>
            <td>CGFS Location:</td>
            <td>${plan.CGFSLocation.toString()}</td>
          </tr>
          <tr>
            <td>QSO:</td>
            <td>${plan.QSO.toString()}</td>
          </tr>
          <tr>
            <td>QAO:</td>
            <td>${plan.QAO.toString()}</td>
          </tr>
          <tr>
            <td>Source:</td>
            <td>${plan.Source.toString()}</td>
          </tr>
          <tr>
            <td>Self-Initiated:</td>
            <td>${plan.SelfInitiated.toString()}</td>
          </tr>
          <tr>
            <td>Coordinator:</td>
            <td>${plan.CoordinatorName.toString()}</td>
          </tr>
          <tr>
            <td>Submitted Date:</td>
            <td>${plan.SubmittedDate.toString()}</td>
          </tr>
          <tr>
            <td>Submitted By:</td>
            <td>${plan.AuthorName.toString()}</td>
          </tr>
          <tr>
            <td>Extension Count:</td>
            <td>${plan.ExtensionCount.toString() ?? "0"}</td>
          </tr>
          <tr>
            <td>Target Implementation Date:</td>
            <td>${plan.ImplementationTargetDate.toString()}</td>
          </tr>
          <tr>
            <td>Implementation Completed Date:</td>
            <td>${plan.QSOImplementAdjudicationDate.toString()}</td>
          </tr>
          <tr>
            <td>Target Verification Date:</td>
            <td>${plan.EffectivenessVerificationTargetD.toString()}</td>
          </tr>
          <tr>
            <td>Supporting Docs Count:</td>
            <td>${supportDocs.length}</td>
          </tr>
          <tr>
            <td>Effectiveness Docs Count:</td>
            <td>${effectivenessDocs.length}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${recordTypeBody}
    <div class="section">
      <h2 class="section-title">Supporting Documents:</h2>
      <ul>
        ${supportDocs.length ? supportDocs.map((doc) => html6`<li>${doc.FileName.toString()}</li>`).join("") : html6`<li style="font-style: italic">No Documents.</li>`}
      </ul>
    </div>
    <div class="section">
      <h2 class="section-title">Actions:</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Responsible Person</th>
            <th>Target Date</th>
            <th>Completion Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map(actionTemplate).join("")}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2 class="section-title">Office Risk Impact</h2>
      <div class="subsection">
        <h3 class="section-subtitle">
          Does this CAR/CAP impact your Office Risks, Mitigations, or Internal
          Controls?
        </h3>
        <div>${plan.OfficeImpactBool.toString()}</div>
      </div>
      <div class="subsection">
        <h3 class="section-subtitle">Please give a brief description:</h3>
        <div data-bind="html: OfficeImpactDesc">
          ${plan.OfficeImpactDesc.toString()}
        </div>
      </div>
    </div>
    <div class="section">
      <h2 class="section-title">Proof of Effectiveness:</h2>
      <div class="subsection">
        <h3 class="section-subtitle">Text Description:</h3>
        <div>${plan.EffectivenessDescription.toString()}</div>
      </div>
      <div class="subsection">
        <h3 class="section-subtitle">Effectiveness Documents:</h3>
        <ul>
          ${effectivenessDocs.length ? effectivenessDocs.map((doc) => html6`<li>${doc.FileName.toString()}</li>`).join("") : html6`<li style="font-style: italic">No Documents.</li>`}
        </ul>
      </div>
    </div>
  </div>
</html>`;
var capBodyTemplate = ({ plan }) => html6` <div>
  <div class="section">
    <h2 class="section-title">Opportunity for Improvement:</h2>
    <div>${plan.OFIDescription.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Discovery Data and Analysis:</h2>
    <div>${plan.DiscoveryDataAnalysis.toString()}</div>
  </div>
</div>`;
var carBodyTemplate = ({ plan, whys }) => html6` <div>
  <div class="section">
    <h2 class="section-title">Problem Description:</h2>
    <div>${plan.ProblemDescription.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Containment Action:</h2>
    <div>${plan.ContainmentAction.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Root Cause Determination:</h2>
    <div class="subsection">
      <h3 class="section-subtitle">5 whys:</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          ${whys.map(
  (why) => html6`<tr>
              <td>${why.Number.toString()}</td>
              <td>${why.Question.toString()}</td>
              <td>${why.Answer.toString()}</td>
            </tr>`
)}
        </tbody>
      </table>
    </div>

    <div class="subsection">
      <h3 class="section-subtitle">Root Cause Determination:</h3>
      <div>${plan.RootCauseDetermination.toString()}</div>
    </div>
  </div>
  <div class="section">
    <h2 class="section-title">Similar Nonconformities:</h2>
    <div class="subsection">
      <h3 class="section-subtitle">
        Could this noncomformance occur in another one of your office processes
        or in a corresponding office in another CGFS location?
      </h3>
      <div>${plan.SimilarNoncomformityBool.toString()}</div>
    </div>
    <div class="subsection">
      <h3 class="section-subtitle">Explanation:</h3>
      <div>${plan.SimilarNoncomformityDesc.toString()}</div>
    </div>
  </div>
</div>`;
var actionTemplate = (action) => html6`
  <tr>
    <td class="nowrap">${action.ActionID.toString()}</td>
    <td>${action.ActionDescription.toString()}</td>
    <td>${action.ActionResponsiblePerson.toString()}</td>
    <td>${action.TargetDate.toString()}</td>
    <td>${action.ImplementationDate.toString()}</td>
    <td>${action.ImplementationStatus.toString()}</td>
  </tr>
`;

// src/pages/app/app.js
window.app = window.app || {};
document.title = "CAR/CAP Tool";
var timer = null;
var refreshInterval = 100 * 60 * 1e3;
function refreshPageInterval() {
  clearTimeout(timer);
  timer = setTimeout(function() {
    window.location.reload(true);
  }, refreshInterval);
}
$(document).mousemove(refreshPageInterval);
Date.prototype.toDateInputValue = function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
function initStaticListRefs() {
  app.listRefs = {};
  app.listRefs.Plans = new sal.NewSPList(CIItemListDef);
  app.listRefs.Actions = new sal.NewSPList(ActionListDef);
  app.listRefs.Whys = new sal.NewSPList(WhyListDef);
  app.listRefs.Rejections = new sal.NewSPList(RejectionListDef);
  app.listRefs.BusinessOffices = new sal.NewSPList(BusinessOfficeListDef);
  app.listRefs.SupportDocs = new sal.NewSPList(DocumentListDef);
  app.listRefs.TempQOs = new sal.NewSPList(TempQOListDef);
  app.listRefs.RecordSources = new sal.NewSPList(RecordSourcesListDef);
}
function approveUpdateRejections() {
  var valuepair = [["Active", 0]];
  var rejectionsToClose = [];
  var curStageIndex = vm.stageDescriptionsArray().findIndex(function(stageDesc) {
    return stageDesc.stage == vm.selectedRecord.ProcessStage();
  });
  vm.Rejections().forEach(function(item, idx, arr) {
    var rejectionStageIndex = vm.stageDescriptionsArray().findIndex(function(stageDesc) {
      return stageDesc.stage == item.Stage;
    });
    if (rejectionStageIndex) {
      if (rejectionStageIndex <= curStageIndex) {
        rejectionsToClose.push(item.ID);
      }
    }
  });
  rejectionsToClose.forEach(function(id2) {
    app.listRefs.Rejections.updateListItem(id2, valuepair, function() {
    });
  });
}
$("#linkRefresh").click(m_fnRefresh);
$("#warnAddProblemResolver").click(function() {
  document.getElementById("divInformation").scrollIntoView();
});
$("#warnAddAction").click(function() {
  document.getElementById("cardAwaitingActionList").scrollIntoView();
});
$("#warnAddContainmentAction").click(function() {
  document.getElementById("cardContainmentAction").scrollIntoView();
});
$("#warnAddWhy").click(function() {
  document.getElementById("rootCauseDiv").scrollIntoView();
});
$("#warnAddRootCause").click(function() {
  document.getElementById("rootCauseDiv").scrollIntoView();
});
$("#warnAddSimilarNoncomformity").click(function() {
  document.getElementById("cardSimilarNoncomformities").scrollIntoView();
});
$("#warnAddProblemResolver2").click(function() {
  document.getElementById("divInformation").scrollIntoView();
});
$("#warnCompleteActions").click(function() {
  document.getElementById("cardAwaitingActionList").scrollIntoView();
});
$("#warnAddSupportingDoc").click(function() {
  document.getElementById("cardSupportingDocuments").scrollIntoView();
});
$("#warnAddEffectivenessDoc").click(function() {
  document.getElementById("cardEffectivenessDocuments").scrollIntoView();
});
$("#buttonSubmitNewAction").click(function() {
  if (vm.controls.allowSubmitNewAction()) {
    m_fnCreateAction(vm.CAPID(), OnActionCreateCallback);
  }
});
$("#btnRequestAllRecords").click(LoadMainData);
function LoadMainData(next) {
  const refreshTask = addTask(tasks.refreshPlans);
  document.getElementById("spanLoadStatus").innerText = "Loading Data";
  next = next ? next : function() {
  };
  var dataLoadIncrementer = new Incremental(0, 3, () => {
    finishTask(refreshTask);
    next();
  });
  app.listRefs.Plans.getListItems("", function(plans) {
    vm.allRecordsArray(plans);
    document.getElementById("spanLoadStatus").innerText = "Plans Loaded";
    dataLoadIncrementer.inc();
  });
  app.listRefs.Actions.getListItems("", function(actions) {
    vm.allActionsArray(actions);
    document.getElementById("spanLoadStatus").innerText = "Actions Loaded";
    dataLoadIncrementer.inc();
  });
  app.listRefs.BusinessOffices.getListItems("", function(offices) {
    vm.allBusinessOffices(offices);
    document.getElementById("spanLoadStatus").innerText = "Offices Loaded";
    dataLoadIncrementer.inc();
  });
  app.listRefs.TempQOs.getListItems("", function(offices) {
    vm.allTempQOs(offices);
    document.getElementById("spanLoadStatus").innerText = "QOs Loaded";
    dataLoadIncrementer.inc();
  });
}
async function LoadSelectedCAP(capid) {
  const viewTask = addTask(tasks.view);
  var capid = capid.Title ? capid.Title : capid;
  const plan = await appContext.Plans.FindByTitle(capid);
  if (plan?.results.length) vm.selectedPlan(plan.results.pop());
  var selectedRecordObj = vm.allRecordsArray().find(function(record) {
    return record.Title == capid;
  });
  if (!selectedRecordObj || !selectedRecordObj.Title) return;
  Common.Utilities.setValuePairs(
    CIItemListDef,
    vm.selectedRecord,
    selectedRecordObj
  );
  var incrementer = new Incremental(0, 2, () => {
    finishTask(viewTask);
  });
  var camlQ = "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" + capid + "</Value></Eq></Where><OrderBy><FieldRef Name='Title' Ascending='FALSE'/></OrderBy></Query></View>";
  app.listRefs.Rejections.getListItems(camlQ, (rejections) => {
    incrementer.inc();
    vm.Rejections(rejections);
  });
  var docsCamlQ = "<View Scope='RecursiveAll'><Query><Where><Eq><FieldRef Name='Record'/><Value Type='Text'>" + capid + "</Value></Eq></Where><OrderBy><FieldRef Name='Title' Ascending='FALSE'/></OrderBy></Query></View>";
  app.listRefs.SupportDocs.getListItems(docsCamlQ, (docs) => {
    incrementer.inc();
    vm.selectedDocuments(docs);
  });
  if (vm.selectedRecord.RecordType() == "CAR") {
    incrementer.incTarget();
    var camlQ = "<View><Query><Where><Contains><FieldRef Name='Title'/><Value Type='Text'>" + capid + "</Value></Contains></Where><OrderBy><FieldRef Name='Number' Ascending='TRUE'/></OrderBy></Query></View>";
    app.listRefs.Whys.getListItems(camlQ, (whys) => {
      vm.RootCauseWhy(whys);
      incrementer.inc();
    });
  }
}
function m_fnApproveProblemQSO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QSOProblemAdjudication", "Approved"],
    ["SubmittedDate", ts],
    ["QSOProblemAdjudicationDate", ts],
    ["ProcessStage", "Developing Action Plan"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveProblemQAO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QAO)) {
    alert(`You don't have the correct role "QAO" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QAOProblemAdjudication", "Approved"],
    ["SubmittedDate", ts],
    ["QAOProblemAdjudicationDate", ts],
    ["ProcessStage", "Developing Action Plan"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveProblemQTMB() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTM-B" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QMSBProblemAdjudication", "Approved"],
    ["QMSBProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QTM Problem Approval"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveProblemQTM() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  const today = /* @__PURE__ */ new Date();
  const target_deadline = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  ).toISOString();
  var valuePair = [
    ["QTMProblemAdjudication", "Approved"],
    ["QTMProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QSO Problem Approval"],
    ["NextTargetDate", target_deadline]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnRejectProblemQSO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QSOProblemAdjudication", "Rejected"],
    ["QSOProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QAO Problem Approval"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectProblemQAO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QAO)) {
    alert(`You don't have the correct role "QAO" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QAOProblemAdjudication", "Rejected"],
    ["QAOProblemAdjudicationDate", ts],
    ["ProcessStage", "Editing"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectProblemQTMB(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTM-B" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QMSBProblemAdjudication", "Rejected"],
    ["QMSBAdjudicationDate", ts],
    ["ProcessStage", "Editing"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectProblemQTM(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QTMProblemAdjudication", "Rejected"],
    ["QTMProblemAdjudicationDate", ts],
    ["ProcessStage", "Editing"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnApprovePlanQSO(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QSOApprovalStatus", "Approved"],
    ["QSOAdjudicationDate", ts]
  ];
  switch (vm.selectedRecord.CGFSLocation()) {
    case "Bangkok":
      valuePair.push([
        "ProcessStage",
        stageDescriptions.PlanApprovalQTMB.stage
      ]);
      break;
    default:
      valuePair.push(["ProcessStage", stageDescriptions.PlanApprovalQTM.stage]);
  }
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApprovePlanQTMB(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTM-B" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QMSBApprovalStatus", "Approved"],
    ["QMSBAdjudicationDate", ts],
    ["ProcessStage", "Pending QTM Plan Approval"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApprovePlanQTM(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QTMApprovalStatus", "Approved"],
    ["QTMAdjudicationDate", ts],
    ["ProcessStage", "Implementing Action Plan"],
    [
      "NextTargetDate",
      new Date(vm.selectedRecord.ImplementationTargetDate.date()).toISOString()
    ]
  ];
  activateActions(function() {
    app.listRefs.Plans.updateListItem(
      planId,
      valuePair,
      onStageApprovedCallback
    );
  });
}
function activateActions(callback) {
  var pendingActions = vm.ActionListItems().filter(function(action) {
    return action.ImplementationStatus == ACTIONSTATE.PENDINGAPPROVAL;
  });
  if (!pendingActions.length) {
    callback();
    return;
  }
  var actionInc = new Incremental(0, pendingActions.length, callback);
  pendingActions.forEach(function(action) {
    app.listRefs.Actions.updateListItem(
      action.ID,
      [["ImplementationStatus", ACTIONSTATE.INPROGRESS]],
      function() {
        actionInc.inc();
      }
    );
  });
}
function m_fnRejectPlanQSO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QSOApprovalStatus", "Rejected"],
    ["QSOAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage
    ]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectPlanQTMB(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTM-B" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QMSBApprovalStatus", "Rejected"],
    ["QMSBAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage
    ]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectPlanQTM(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QTMApprovalStatus", "Rejected"],
    ["QTMAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage
    ]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnApproveImplement() {
  var planId = vm.selectedRecord.ID();
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["ProcessStage", "Pending Effectiveness Submission"],
    ["QSOImplementAdjudication", "Accepted"],
    ["QSOImplementAdjudicationDate", ts],
    [
      "NextTargetDate",
      new Date(
        vm.selectedRecord.EffectivenessVerificationTargetD.date()
      ).toISOString()
    ]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnRejectImplement(callback) {
  var planId = vm.selectedRecord.ID();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["ProcessStage", "Implementing Action Plan"],
    ["QSOImplementAdjudication", "Rejected"],
    ["QSOImplementAdjudicationDate", ts]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnApproveEffectivenessQSO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QSOEffectivenessAdjudication", "Accepted"],
    ["QSOEffectivenessAdjudicationDate", ts]
  ];
  switch (vm.selectedRecord.CGFSLocation()) {
    case "Bangkok":
      valuePair.push(["ProcessStage", "Pending QTM-B Effectiveness Approval"]);
      break;
    default:
      valuePair.push(["ProcessStage", "Pending QTM Effectiveness Approval"]);
  }
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveEffectivenessQTMB() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTM-B" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QMSBEffectivenessAdjudication", "Accepted"],
    ["QMSBEffectivenessAdjudicationDat", ts],
    ["ProcessStage", "Pending QTM Effectiveness Approval"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveEffectivenessQTM() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  approveUpdateRejections();
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var valuePair = [
    ["QTMEffectivenessAdjudication", "Accepted"],
    ["QTMEffectivenessAdjudicationDate", ts],
    ["NextTargetDate", (/* @__PURE__ */ new Date(0)).toISOString()],
    ["ProcessStage", "Closed: Accepted"],
    ["Active", "0"]
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnRejectEffectivenessQSO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QSO)) {
    alert(`You don't have the correct role "QSO" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var rejectReason = vm.effectivenessRejectReason();
  var valuePair = [
    ["QSOEffectivenessAdjudication", "Rejected"],
    ["QSOEffectivenessAdjudicationDate", ts]
  ];
  switch (rejectReason) {
    case "Lack of Evidence":
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected"
      ]);
      break;
    case "Not Effective":
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectEffectivenessQTMB(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTMB)) {
    alert(`You don't have the correct role "QTMB" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var rejectReason = vm.effectivenessRejectReason();
  var valuePair = [
    ["QMSBEffectivenessAdjudication", "Rejected"],
    ["QMSBEffectivenessAdjudicationDat", ts]
  ];
  switch (rejectReason) {
    case "Lack of Evidence":
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected"
      ]);
      break;
    case "Not Effective":
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectEffectivenessQTM(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES2.QTM)) {
    alert(`You don't have the correct role "QTM" to perform this action`);
    return;
  }
  var ts = (/* @__PURE__ */ new Date()).toISOString();
  var rejectReason = vm.effectivenessRejectReason();
  var valuePair = [
    ["QTMEffectivenessAdjudication", "Rejected"],
    ["QTMEffectivenessAdjudicationDate", ts]
  ];
  switch (rejectReason) {
    case "Lack of Evidence":
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected"
      ]);
      break;
    case "Not Effective":
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRefresh(result, value) {
  if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
    return;
  }
  addTask(tasks.refresh);
  LoadMainData(function() {
    LoadSelectedCAP(vm.selectedTitle());
    finishTask(tasks.refresh);
  });
}
async function onStageApprovedCallback(result) {
  if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
    return;
  }
  const refreshTask = addTask(tasks.refresh);
  LoadMainData(async function() {
    await LoadSelectedCAP(vm.selectedTitle());
    const plan = ko.unwrap(vm.selectedPlan);
    await stageApprovedNotification(plan);
    finishTask(refreshTask);
  });
}
async function onStageRejectedCallback(plan, rejection) {
  return new Promise((resolve) => {
    const refreshTask = addTask(tasks.refresh);
    LoadMainData(async function() {
      await LoadSelectedCAP(vm.selectedTitle());
      const plan2 = ko.unwrap(vm.selectedPlan);
      await stageRejectedNotification(plan2, rejection);
      finishTask(refreshTask);
      resolve();
    });
  });
}
function OnActionEditCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    addTask(tasks.newAction);
    app.listRefs.Actions.getListItems("", function(actions) {
      vm.allActionsArray(actions);
      vm.controls.record.updateImplementationDate();
      finishTask(tasks.newAction);
    });
  }
}
function OnActionCreateCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    addTask(tasks.newAction);
    app.listRefs.Actions.getListItems("", function(actions) {
      vm.allActionsArray(actions);
      vm.controls.record.updateImplementationDate();
      finishTask(tasks.newAction);
    });
  }
}
function OnCallbackFormRefresh(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    m_fnRefresh();
  }
}
function initComplete() {
  ko.applyBindings(vm);
  document.getElementById("spanLoadStatus").innerText = "Building Interface";
  vm.currentUser(sal.globalConfig.currentUser);
  var tabId = getUrlParam("tab");
  var capid = getUrlParam("capid");
  $("#showme").hide();
  $("#tabs").show();
  if (!tabId) {
    let defaultTab = vm.tabOpts.myPlans;
    switch (vm.AdminType()) {
      case ROLES2.ADMINTYPE.QO:
        defaultTab = vm.tabOpts.qo;
        break;
      case ROLES2.ADMINTYPE.QTM:
        defaultTab = vm.tabOpts.all;
        break;
      case ROLES2.ADMINTYPE.QTMB:
        defaultTab = vm.tabOpts.qtmb;
        break;
      default:
    }
    vm.tabs.selectById(defaultTab);
  }
  if (capid) {
    vm.CAPID(capid);
    vm.selectedTitle(capid);
  }
  finishTask(tasks.init);
  loadFinish = /* @__PURE__ */ new Date();
  var loadTimeSeconds = (loadFinish - loadStart) / 1e3;
  vm.appLoadTime(loadTimeSeconds + "s");
  console.log("Application Load Time: ", (loadFinish - loadStart) / 1e3);
}
var loadStart;
var loadFinish = 0;
async function initApp() {
  loadStart = /* @__PURE__ */ new Date();
  initSal();
  InitSal();
  Common.Init();
  document.getElementById("spanLoadStatus").innerText = "Initiating Application";
  vm = await App.Create();
  const initTask = addTask(tasks.init);
  initStaticListRefs();
  LoadMainData(initComplete);
}
var loc = window.location;
var directSiteUrl = loc.origin;
if (loc.host[0] == "s") {
  directSiteUrl += "/sites/cgfsweb/QMS/";
} else {
  directSiteUrl += "/sites/QMS-CI";
}
window.ROLES = ROLES2;
var EXTENSIONDAYS = 45;
var ACTIONSTATE = {
  PENDINGAPPROVAL: "Pending Plan Approval",
  INPROGRESS: "In progress",
  COMPLETED: "Completed"
};
function convertModelToViewfield(model) {
  let vf = "<ViewFields>";
  for (let i2 = 0; i2 < model.length; i2++) {
    vf = vf + "<FieldRef Name='" + model[i2] + "'/>";
  }
  vf += "</ViewFields>";
  return vf;
}
var locations = [
  "Charleston",
  "Bangkok",
  "Washington",
  "Paris",
  "Sofia",
  "Manila"
];
var RecordSourcesListDef = {
  name: "Record_Sources",
  title: "Record_Sources",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    RecordType: { type: "Text" },
    SelfInitiated: { type: "Bool" }
  }
};
var CIItemListDef = {
  name: "CAP_Main",
  title: "CAP_Main",
  viewModelObj: "selectedRecord",
  viewFields: {
    ID: { type: "Text" },
    Active: { type: "Bool" },
    Author: { type: "Person" },
    AuthorName: { type: "Text" },
    CloseDate: { type: "Date" },
    CancelReason: { type: "Text" },
    Created: { type: "Date" },
    Title: { type: "Text" },
    RecordType: { type: "Text" },
    BusinessOffice: { type: "Text" },
    CGFSLocation: { type: "Text" },
    QSO: { type: "Person" },
    QSOName: { type: "Text" },
    QAO: { type: "Person" },
    QAOName: { type: "Text" },
    OFIDescription: { type: "Text" },
    DiscoveryDataAnalysis: { type: "Text" },
    SubmittedDate: { type: "Date" },
    SubmittedBy: { type: "Text" },
    ProblemResolverName: { type: "Person" },
    CoordinatorName: { type: "Text" },
    Subject: { type: "Text" },
    QSOAdjudicationDate: { type: "Date" },
    QSOApprovalStatus: { type: "Text" },
    QMSBAdjudicationDate: { type: "Date" },
    QMSBApprovalStatus: { type: "Text" },
    QTMAdjudicationDate: { type: "Date" },
    QTMApprovalStatus: { type: "Text" },
    RecordStatus: { type: "Text" },
    EffectivenessRejectReason: { type: "Text" },
    ExtensionCount: { type: "Number" },
    ExtensionRequested: { type: "Bool" },
    OfficeImpactBool: { type: "Text" },
    OfficeImpactDesc: { type: "Text" },
    QSOEffectivenessAdjudication: { type: "Text" },
    QMSBEffectivenessAdjudication: { type: "Text" },
    QTMEffectivenessAdjudication: { type: "Text" },
    QSOEffectivenessAdjudicationDate: { type: "Date" },
    QMSBEffectivenessAdjudicationDat: { type: "Date" },
    QTMEffectivenessAdjudicationDate: { type: "Date" },
    SubmittedEffectivenessDate: { type: "Date" },
    SubmittedImplementDate: { type: "Date" },
    EffectivenessVerificationTargetD: { type: "Date" },
    QSOImplementAdjudication: { type: "Text" },
    QSOImplementAdjudicationDate: { type: "Date" },
    ImplementationTargetDate: { type: "Date" },
    EffectivenessDescription: { type: "Text" },
    ProblemDescription: { type: "Text" },
    SelfInitiated: { type: "Bool" },
    ContainmentAction: { type: "Text" },
    ContainmentActionDate: { type: "Date" },
    RootCauseDetermination: { type: "Text" },
    QSOProblemAdjudication: { type: "Text" },
    QSOProblemAdjudicationDate: { type: "Date" },
    QAOProblemAdjudication: { type: "Text" },
    QAOProblemAdjudicationDate: { type: "Date" },
    QMSBProblemAdjudication: { type: "Text" },
    QMSBProblemAdjudicationDate: { type: "Date" },
    QTMProblemAdjudication: { type: "Text" },
    QTMProblemAdjudicationDate: { type: "Date" },
    Source: { type: "Text" },
    SimilarNoncomformityBool: { type: "Bool" },
    SimilarNoncomformityDesc: { type: "Text" },
    ProcessStage: { type: "Text" },
    PreviousStage: { type: "Text" },
    NextTargetDate: { type: "Date" }
  }
};
var CAPModel = [
  "Active",
  "Title",
  "RecordType",
  "BusinessOffice",
  "CGFSLocation",
  "QSO",
  "QSOName",
  "QAO",
  "QAOName",
  "OFIDescription",
  "DiscoveryDataAnalysis",
  "SubmittedDate",
  "SubmittedBy",
  "ProblemResolverName",
  "CoordinatorName",
  "Subject",
  "QSOAdjudicationDate",
  "QSOApprovalStatus",
  "QMSBAdjudicationDate",
  "QMSBApprovalStatus",
  "QTMAdjudicationDate",
  "QTMApprovalStatus",
  "CAP_Source",
  "RecordStatus",
  "EffectivenessRejectReason",
  "OfficeImpactBool",
  "OfficeImpactDesc",
  "QSOEffectivenessAdjudication",
  "QMSBEffectivenessAdjudication",
  "QTMEffectivenessAdjudication",
  "QSOEffectivenessAdjudicationDate",
  "QMSBEffectivenessAdjudicationDat",
  "QTMEffectivenessAdjudicationDate",
  "SubmittedEffectivenessDate",
  "SubmittedImplementDate",
  "EffectivenessVerificationTargetD",
  "QSOImplementAdjudication",
  "QSOImplementAdjudicationDate",
  "ImplementationTargetDate",
  "EffectivenessDescription",
  "ProblemDescription",
  "SelfInitiated",
  "ContainmentAction",
  "ContainmentActionDate",
  "RootCauseDetermination",
  "QSOProblemAdjudication",
  "QSOProblemAdjudicationDate",
  "QAOProblemAdjudication",
  "QAOProblemAdjudicationDate",
  "QMSBProblemAdjudication",
  "QMSBProblemAdjudicationDate",
  "QTMProblemAdjudication",
  "QTMBProblemAdjudicationDate",
  "Source",
  "SimilarNoncomformityBool",
  "SimilarNoncomformityDesc",
  "ProcessStage",
  "PreviousStage",
  "NextTargetDate",
  "PlanSubmissionTargetDate",
  "Author",
  "AuthorName"
];
var ActionListDef = {
  name: "CAP_Actions",
  title: "CAP_Actions",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    ActionDescription: { type: "Text" },
    ActionID: { type: "Text" },
    TargetDate: { type: "Date" },
    ActionResponsiblePerson: { type: "Person" },
    ImplementationDate: { type: "Date" },
    ImplementationDescription: { type: "Text" },
    ImplementationStatus: { type: "Text" },
    ImplementationRemark: { type: "Text" },
    PreviousTargetDate: { type: "Date" },
    RevisionCount: { type: "Text" },
    ExtensionCount: { type: "Text" },
    PreviousActionDescription: { type: "Text" },
    PreviousActionResponsiblePerson: { type: "Person" }
  }
};
var ActionModel = [
  "Title",
  "ActionDescription",
  "ActionID",
  "TargetDate",
  "ActionResponsiblePerson",
  "ImplementationDate",
  "ImplementationDescription",
  "ImplementationStatus",
  "ImplementationRemark",
  "RequiresApproval",
  "PreviousTargetDate",
  "RevisionCount",
  "ExtensionCount",
  "PreviousActionDescription",
  "PreviousActionResponsiblePerson"
];
var WhyListDef = {
  name: "Root_Cause_Why",
  title: "Root_Cause_Why",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    Number: { type: "Text" },
    Question: { type: "Text" },
    Answer: { type: "Text" }
  }
};
var WhyModel = ["Title", "Number", "Question", "Answer"];
var RejectionListDef = {
  name: "Rejections",
  title: "Rejections",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    Reason: { type: "Text" },
    Stage: { type: "Text" },
    Date: { type: "Date" },
    Rejector: { type: "Person" },
    Active: { type: "Bool" },
    RejectionId: { type: "Text" }
  }
};
var RejectionModel = [
  "Title",
  "Reason",
  "Stage",
  "Date",
  "Rejector",
  "Active",
  "RejectionId"
];
var BusinessOfficeListDef = {
  name: "Business_Office",
  title: "Business_Office",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    ol_Department: { type: "Text" },
    QAO: { type: "Person" },
    QSO_Charleston: { type: "Person" },
    QSO_Bangkok: { type: "Person" },
    QSO_Washington: { type: "Person" },
    QSO_Paris: { type: "Person" },
    QSO_Sofia: { type: "Person" },
    QSO_Manila: { type: "Person" }
  }
};
var BusinessOfficeModel = [
  "Title",
  "ol_Department",
  "QAO",
  "QSO_Charleston",
  "QSO_Bangkok",
  "QSO_Washington",
  "QSO_Paris",
  "QSO_Sofia",
  "QSO_Manila"
];
var TempQOListDef = {
  name: "Temp_QOs",
  title: "Temp_QOs",
  viewFields: {
    ID: { type: "Text" },
    Person: { type: "Person" },
    Office: { type: "Lookup" },
    Location: { type: "Text" },
    Role: { type: "Text" },
    Note: { type: "Text" }
  }
};
var DocumentListDef = {
  name: "SupportDocumentLibrary",
  title: "SupportDocumentLibrary",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    FileLeafRef: { type: "Text" },
    Record: { type: "Text" },
    FileRef: { type: "Text" },
    DocType: { type: "Text" },
    Author: { type: "Person" }
  }
};
var DocumentModel = ["Title", "LinkFileName", "Record", "DocType"];
var recordViewFields = convertModelToViewfield(CAPModel);
var actionViewFields = convertModelToViewfield(ActionModel);
var documentViewFields = convertModelToViewfield(DocumentModel);
var whyViewFields = convertModelToViewfield(WhyModel);
var rejectionViewFields = convertModelToViewfield(RejectionModel);
var businessOfficeViewFields = convertModelToViewfield(BusinessOfficeModel);
function checkComplete(action) {
  return action.ImplementationStatus != "Completed";
}
function CAPViewModel(capIdstring) {
  console.log("evaluating viewmodel");
  var self = this;
  var APPPROCESSTIMEOUT = 10 * 1e3;
  var APPPROCESSDISMISSTIMEOUT = 1e3;
  self.app = {
    currentDialogs
  };
  self.bindingCompleteHandlers = {
    tableBound: function(nodes) {
      var tableId = nodes.id;
      makeDataTable(tableId);
    }
  };
  self.stageDescriptionsArray = ko.pureComputed(function() {
    return Object.keys(stageDescriptions).map(function(key) {
      return stageDescriptions[key];
    });
  });
  self.impersonateUserField = new PeopleField({
    displayName: "Impersonate User"
  });
  self.impersonateUserField.Value.subscribe(function(people) {
    if (people.length) {
      self.currentUser(people[0]);
      self.currentUserObj.id(people[0].get_id());
    } else {
      self.currentUser(sal.globalConfig.currentUser);
      self.currentUserObj.id(sal.globalConfig.currentUser);
    }
  });
  self.currentUser = ko.observable();
  self.currentUserObj = {
    id: ko.observable(_spPageContextInfo.userId),
    businessOfficeOwnership: ko.pureComputed(function() {
      var userId = self.currentUserObj.id();
      var myOffices = [];
      self.allBusinessOffices().map(function(office) {
        if (office.QAO.get_lookupId() == userId) {
          var qaoObj = {};
          qaoObj.id = office.ID;
          qaoObj.location = "All";
          qaoObj.office = office.Title;
          qaoObj.department = office.Department;
          qaoObj.type = "qao";
          myOffices.push(qaoObj);
        }
        for (let j = 0; j < locations.length; j++) {
          var qsoLoc = office["QSO_" + locations[j]];
          if (qsoLoc && qsoLoc.get_lookupId() == userId) {
            var adminObj = {};
            adminObj.id = office.ID;
            adminObj.location = locations[j];
            adminObj.office = office.Title;
            adminObj.department = office.Department;
            adminObj.type = "qso";
            myOffices.push(adminObj);
          }
        }
      });
      self.allTempQOs().map(function(office) {
        if (office.Person.get_lookupId() == userId) {
          var adminObj = {
            id: office.Office.get_lookupId(),
            office: office.Office.get_lookupValue(),
            location: office.Location,
            type: office.Role
          };
          myOffices.push(adminObj);
        }
      });
      return myOffices;
    })
  };
  const adminType = getUrlParam("role");
  self.AdminType = currentRole;
  self.userRoleOpts = userRoleOpts;
  self.AdminType(adminType || "");
  self.AdminType.subscribe((val) => {
    setUrlParam("role", val);
  });
  self.runningTasks = runningTasks;
  self.blockingTasks = blockingTasks;
  self.tabOpts = {
    qtm: new Tab({
      urlKey: "qtm",
      linkText: "All Open CARs/CAPs",
      template: {
        id: "tabs-qtm",
        data: self
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES2.ADMINTYPE.QTM;
      })
    }),
    qtmb: new Tab({
      urlKey: "qtmb",
      linkText: "Bangkok Open CARs/CAPs",
      template: {
        id: "tabs-qtmb",
        data: self
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES2.ADMINTYPE.QTMB;
      })
    }),
    myPlans: new Tab({
      urlKey: "my-plans",
      linkText: "My CARs/CAPs",
      template: {
        id: "tabs-my-plans",
        data: self
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES2.ADMINTYPE.USER;
      })
    }),
    qo: new Tab({
      urlKey: "qo",
      linkText: "QO CARs/CAPs",
      template: {
        id: "tabs-qo",
        data: self
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES2.ADMINTYPE.QO;
      })
    }),
    detail: new Tab({
      urlKey: "detail",
      linkText: "CAR/CAP Details",
      template: {
        id: "tabs-detail",
        data: self
      }
    }),
    awaitingAction: new Tab({
      urlKey: "awaiting",
      linkText: "Awaiting Action",
      template: {
        id: "tabs-awaiting",
        data: self
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES2.ADMINTYPE.USER;
      })
    }),
    lookup: new Tab({
      urlKey: "lookup",
      linkText: "Lookup",
      template: {
        id: "tabs-lookup",
        data: self
      }
    })
  };
  self.tabs = new TabsModule(Object.values(self.tabOpts));
  self.navigateToRecord = async function(record) {
    vm.CAPID(record.Title);
    vm.selectedTitle(record.Title);
    vm.tabs.selectTab(self.tabOpts.detail);
  };
  self.selectedTitleObs = ko.observable();
  self.selectedTitle = ko.pureComputed({
    write: function(newSelection) {
      if (!newSelection) return;
      if (self.currentlyEditingSection() > 0) {
        if (confirm("Do you want to discard changes?")) {
          self.discardEdits();
        } else {
          self.selectedTitle.notifySubscribers();
          return;
        }
      }
      Common.Utilities.updateUrlParam("capid", newSelection);
      if (newSelection == self.selectedRecord.Title()) {
        return;
      }
      self.selectedTitleObs(newSelection);
      LoadSelectedCAP(newSelection);
    },
    read: function() {
      return self.selectedTitleObs();
    }
  });
  self.allBusinessOffices = ko.observableArray([]);
  self.allTempQOs = ko.observableArray([]);
  self.allRecordsArray = ko.observableArray([]);
  self.allActionsArray = ko.observableArray([]);
  self.allOpenRecordsArray = ko.pureComputed(function() {
    return self.allRecordsArray().filter(function(record) {
      return record.Active;
    });
  });
  self.allOpenActionsArray = ko.pureComputed(function() {
    return self.allActionsArray().filter(function(action) {
      return action.ImplementationStatus != "Completed";
    });
  });
  self.actionsMapping = ko.pureComputed(function() {
    var start = /* @__PURE__ */ new Date();
    var plans = {};
    self.allRecordsArray().map(function(plan) {
      plans[plan.Title] = self.allActionsArray().filter(function(action) {
        return action.Title == plan.Title;
      });
    });
    var end = /* @__PURE__ */ new Date();
    console.log("Actions Mapped in: ", (end - start) / 1e3);
    return plans;
  });
  self.myOpenRecordsArray = ko.pureComputed(function() {
    var userId = self.currentUserObj.id();
    return self.allOpenRecordsArray().filter(function(record) {
      if (record.ProblemResolverName && record.ProblemResolverName.get_lookupId() == userId) {
        return true;
      }
      if (record.Author.get_lookupId() == userId) {
        return true;
      }
      return false;
    });
  });
  self.myOpenActionsArray = ko.pureComputed(function() {
    var userId = self.currentUserObj.id();
    return self.allOpenActionsArray().filter(function(action) {
      return action.ActionResponsiblePerson.get_lookupId() == userId;
    });
  });
  self.myAwaitingActionRecords = ko.pureComputed(function() {
    var myStages = [
      "Implementing Action Plan",
      "Developing Action Plan",
      "Pending Effectiveness Submission"
    ];
    return self.myOpenRecordsArray().filter(function(record) {
      return myStages.includes(record.ProcessStage);
    });
  });
  self.myAwaitingActionActions = ko.pureComputed(function() {
    return self.myOpenActionsArray().filter(function(action) {
      return action.ImplementationStatus == "In progress";
    });
  });
  self.qoOpenRecords = ko.pureComputed(function() {
    var userId = self.currentUserObj.id();
    var officeIds = self.currentUserObj.businessOfficeOwnership().map(function(office) {
      return office.id;
    });
    var assignedRecords = self.allOpenRecordsArray().filter(function(record) {
      if (record.QSO && record.QSO.get_lookupId() == userId) {
        return true;
      }
      if (record.QAO && record.QAO.get_lookupId() == userId) {
        return true;
      }
      return false;
    });
    var officeRecords = [];
    self.currentUserObj.businessOfficeOwnership().map(function(office) {
      if (office.type == ROLES2.QSO) {
        officeRecords = officeRecords.concat(
          self.allOpenRecordsArray().filter(function(record) {
            return record.BusinessOffice.get_lookupId() == office.id && (office.location == "All" || record.CGFSLocation == office.location);
          })
        );
      }
      if (office.type == ROLES2.QAO) {
        officeRecords = officeRecords.concat(
          self.allOpenRecordsArray().filter(function(record) {
            return record.BusinessOffice.get_lookupId() == office.id;
          })
        );
      }
    });
    assignedRecords = assignedRecords.concat(officeRecords);
    return assignedRecords.filter(function(record, index, self2) {
      return index === self2.findIndex(function(subrecord) {
        return subrecord.Title === record.Title;
      });
    });
  });
  self.qoOpenActions = ko.pureComputed(function() {
    var qoActions = [];
    self.qoOpenRecords().forEach(function(record) {
      qoActions = qoActions.concat(self.actionsMapping()[record.Title]);
    });
    return qoActions.filter(function(action) {
      return action.ImplementationStatus != "Completed";
    });
  });
  self.qoAwaitingActionRecords = ko.pureComputed(function() {
    var qoStages = [
      "Pending QSO Problem Approval",
      "Pending QAO Problem Approval",
      "Pending QSO Plan Approval",
      "Pending QSO Plan Approval: Action",
      "Pending QSO Implementation Approval",
      "Pending QSO Effectiveness Approval"
    ];
    return self.qoOpenRecords().filter(function(record) {
      if (qoStages.includes(record.ProcessStage)) {
        return true;
      }
    });
  });
  self.filterRequiresQOAction = function(record) {
    var qoStages = [
      "Pending QSO Problem Approval",
      "Pending QAO Problem Approval",
      "Pending QSO Plan Approval",
      "Pending QSO Plan Approval: Action",
      "Pending QSO Implementation Approval",
      "Pending QSO Effectiveness Approval"
    ];
    if (qoStages.includes(record.ProcessStage)) {
      return true;
    }
  };
  self.filterAwaitingActionByCurRoleStages = ko.pureComputed(function() {
    var stages = [];
    switch (vm.AdminType()) {
      case ROLES2.ADMINTYPE.USER:
        stages = [
          "Implementing Action Plan",
          "Developing Action Plan",
          "Pending Effectiveness Submission"
        ];
        break;
      case ROLES2.ADMINTYPE.QO:
        stages = [
          "Pending QSO Problem Approval",
          "Pending QAO Problem Approval",
          "Pending QSO Plan Approval",
          "Pending QSO Plan Approval: Action",
          "Pending QSO Implementation Approval",
          "Pending QSO Effectiveness Approval"
        ];
        break;
      case ROLES2.ADMINTYPE.QTM:
        stages = [
          "Pending QTM Problem Approval",
          "Pending QTM Plan Approval",
          "Pending QTM Effectiveness Approval"
        ];
        break;
      case ROLES2.ADMINTYPE.QTMB:
        stages = [
          "Pending QTM-B Problem Approval",
          "Pending QTM-B Plan Approval",
          "Pending QTM-B Effectiveness Approval"
        ];
        break;
      default:
    }
    return stages;
  });
  self.qoAwaitingActionActions = ko.pureComputed(function() {
    var qoStages = ["Requires Approval QSO", "Requires Approval QAO"];
    return self.qoOpenActions().filter(function(action) {
      return qoStages.includes(action.ImplementationStatus);
    });
  });
  self.qtmbOpenRecordsArray = ko.pureComputed(function() {
    return self.allOpenRecordsArray().filter(function(record) {
      return record.CGFSLocation == "Bangkok";
    });
  });
  self.qtmbAwaitingActionRecords = ko.pureComputed(function() {
    var qtmbStages = [
      "Pending QTM-B Problem Approval",
      "Pending QTM-B Plan Approval",
      "Pending QTM-B Effectiveness Approval"
    ];
    return self.qtmbOpenRecordsArray().filter(function(record) {
      return qtmbStages.includes(record.ProcessStage);
    });
  });
  self.filterRequiresQTMBAction = function(record) {
    var qtmStages = [
      "Pending QTM-B Problem Approval",
      "Pending QTM-B Plan Approval",
      "Pending QTM-B Effectiveness Approval"
    ];
    return qtmStages.includes(record.ProcessStage);
  };
  self.qtmAwaitingActionRecords = ko.pureComputed(function(record) {
    var qtmStages = [
      "Pending QTM Problem Approval",
      "Pending QTM Plan Approval",
      "Pending QTM Effectiveness Approval"
    ];
    return self.allOpenRecordsArray().filter(function(record2) {
      return qtmStages.includes(record2.ProcessStage);
    });
  });
  self.filterRequiresQTMAction = function(record) {
    var qtmStages = [
      "Pending QTM Problem Approval",
      "Pending QTM Plan Approval",
      "Pending QTM Effectiveness Approval"
    ];
    return qtmStages.includes(record.ProcessStage);
  };
  self.coordinatorAwaitingActionRecords = ko.pureComputed(function(record) {
    var userId = self.currentUserObj.id();
    var coordinatorStages = [
      "Implementing Action Plan",
      "Developing Action Plan",
      "Pending Effectiveness Submission"
    ];
    return self.allOpenRecordsArray().filter(function(record2) {
      return record2.ProblemResolverName.get_lookupId() == userId && coordinatorStages.includes(record2.ProcessStage);
    });
  });
  self.CAPIDOptions = ko.pureComputed(function() {
    var records = [];
    switch (vm.AdminType()) {
      case ROLES2.ADMINTYPE.USER:
        records = self.myOpenRecordsArray();
        break;
      case ROLES2.ADMINTYPE.QO:
        records = self.qoOpenRecords();
        break;
      case ROLES2.ADMINTYPE.QTM:
        records = self.allOpenRecordsArray();
        break;
      case ROLES2.ADMINTYPE.QTMB:
        records = self.qtmbOpenRecordsArray();
        break;
    }
    return records.map(function(record) {
      return record.Title;
    }).sort().reverse();
  });
  self.MyAwaitingActionRecordsArray = ko.pureComputed(function() {
    switch (vm.AdminType()) {
      case ROLES2.ADMINTYPE.QO:
        return self.qoOpenRecords();
      case ROLES2.ADMINTYPE.QTM:
        return self.allOpenRecordsArray();
    }
  });
  self.LookupRecordsArray = ko.observableArray();
  self.ApprovalArray = ko.observableArray();
  self.ActionListItems = ko.pureComputed(function() {
    return self.actionsMapping()[self.selectedRecord.Title()] || [];
  });
  self.ActionsRequiringAction = ko.observableArray();
  self.LookupArray = ko.observableArray();
  self.selectedDocuments = ko.observableArray();
  self.SupportDocuments = ko.pureComputed(function() {
    return self.selectedDocuments().filter(function(doc) {
      return doc.DocType == "Support";
    });
  });
  self.EffectivenessDocuments = ko.pureComputed(function() {
    return self.selectedDocuments().filter(function(doc) {
      return doc.DocType == "Effectiveness";
    });
  });
  self.RecordType = ko.observable();
  self.RecordStatus = ko.observable();
  function eachRecursive(obj, executor) {
    for (var k in obj) {
      if (typeof obj[k] == "object" && obj[k] !== null) {
        eachRecursive(obj[k], executor);
      } else {
        executor(k, obj[k]);
      }
    }
  }
  function setIsEditingFalse(key, value) {
    if (key == "isEditing") {
      if (value()) {
        value(false);
      }
    }
  }
  self.discardEdits = function() {
    eachRecursive(self.section, setIsEditingFalse);
  };
  self.currentlyEditingSection = function() {
    var cnt = 0;
    eachRecursive(self.section, function(key, value) {
      if (key == "isEditing") {
        if (value()) {
          cnt++;
        }
      }
    });
    return cnt;
  };
  self.section = {
    Info: {
      coordinator: {
        isEditing: ko.observable(false),
        isEditable: ko.pureComputed(function() {
          if (!self.selectedRecord.Active()) {
            return false;
          }
          if (self.selectedRecord.curUserHasRole(ROLES2.QSO)) {
            return true;
          }
          return false;
        }),
        tempCoordinator: new PeopleField({
          displayName: "CAR/CAP Coordinator"
        }),
        edit: function() {
          if (self.selectedRecord.ProblemResolverName.ensuredPeople().length) {
            self.section.Info.coordinator.tempCoordinator.set(
              self.selectedRecord.ProblemResolverName.ensuredPeople()[0]
            );
          }
          self.section.Info.coordinator.isEditing(true);
        },
        save: function() {
          self.selectedRecord.ProblemResolverName.removeAllPeople();
          const coord = self.section.Info.coordinator.tempCoordinator.Value();
          const coordString = `${coord.ID};#${coord.LoginName};#`;
          var valuePair = [
            ["ProblemResolverName", coordString],
            ["CoordinatorName", coord.Title]
          ];
          self.section.Info.coordinator.isEditing(false);
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            valuePair,
            m_fnRefresh
          );
        },
        cancel: function() {
          self.section.Info.coordinator.isEditing(false);
        }
      }
    },
    OpportunityForImprovement: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (self.section.OpportunityForImprovement.isEditing()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
          self.selectedRecord.ProcessStageKey()
        ) >= 0) {
          return true;
        }
        return false;
      }),
      field: new TextAreaField({
        displayName: "Opportunity for Improvement",
        isRichText: true
      }),
      edit: function() {
        self.section.OpportunityForImprovement.field.Value(
          self.selectedRecord.OFIDescription()
        );
        self.section.OpportunityForImprovement.isEditing(true);
      },
      save: function() {
        var valuepair = [
          [
            "OFIDescription",
            self.section.OpportunityForImprovement.field.Value()
          ]
        ];
        self.section.OpportunityForImprovement.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function() {
        self.section.OpportunityForImprovement.isEditing(false);
      }
    },
    DiscoveryDataAnalysis: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (self.section.DiscoveryDataAnalysis.isEditing()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
          self.selectedRecord.ProcessStageKey()
        ) >= 0) {
          return true;
        }
        return false;
      }),
      field: new TextAreaField({
        displayName: "Data Discovery and Analysis",
        isRichText: true
      }),
      edit: function() {
        self.section.DiscoveryDataAnalysis.field.Value(
          self.selectedRecord.DiscoveryDataAnalysis()
        );
        self.section.DiscoveryDataAnalysis.isEditing(true);
      },
      save: function() {
        var valuepair = [
          [
            "DiscoveryDataAnalysis",
            self.section.DiscoveryDataAnalysis.field.Value()
          ]
        ];
        self.section.DiscoveryDataAnalysis.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function() {
        self.section.DiscoveryDataAnalysis.isEditing(false);
      }
    },
    ProblemDescription: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (self.section.ProblemDescription.isEditing()) {
          return false;
        }
        if (self.selectedRecord.SelfInitiated() == "Yes") {
          if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
            return false;
          }
          if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0) {
            return true;
          }
        } else if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return self.selectedRecord.ProcessStageKey() == "ProblemApprovalQTMB";
        } else {
          return self.selectedRecord.ProcessStageKey() == "ProblemApprovalQTM";
        }
        return false;
      }),
      field: new TextAreaField({
        displayName: "Problem Description",
        isRichText: true
      }),
      edit: function() {
        self.section.ProblemDescription.field.Value(
          self.selectedRecord.ProblemDescription()
        );
        self.section.ProblemDescription.isEditing(true);
      },
      save: function() {
        var valuepair = [
          ["ProblemDescription", self.section.ProblemDescription.field.Value()]
        ];
        self.section.ProblemDescription.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function() {
        self.section.ProblemDescription.isEditing(false);
      }
    },
    ContainmentAction: {
      isVisible: ko.pureComputed(function() {
        return self.selectedRecord.SelfInitiated() == "Yes" || self.selectedRecord.ProcessStageObj().stageNum >= 2;
      }),
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (self.section.ContainmentAction.isEditing()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
          self.selectedRecord.ProcessStageKey()
        ) >= 0) {
          return true;
        }
        return false;
      }),
      field: new TextAreaField({
        displayName: "Containment Action",
        isRichText: true
      }),
      actionDate: new DateField({ displayName: "Containment Action Date" }),
      edit: function() {
        self.section.ContainmentAction.field.Value(
          self.selectedRecord.ContainmentAction()
        );
        if (self.selectedRecord.ContainmentActionDate.isDate() && self.selectedRecord.ContainmentActionDate.date().getTime()) {
          self.section.ContainmentAction.actionDate.set(
            self.selectedRecord.ContainmentActionDate.date()
          );
        }
        self.section.ContainmentAction.isEditing(true);
      },
      save: function() {
        var valuepair = [
          ["ContainmentAction", self.section.ContainmentAction.field.Value()],
          [
            "ContainmentActionDate",
            self.section.ContainmentAction.actionDate.get() ?? (/* @__PURE__ */ new Date(0)).toISOString()
          ]
        ];
        self.section.ContainmentAction.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function() {
        self.section.ContainmentAction.isEditing(false);
      }
    },
    RootCause: {
      new: function() {
        const rootCauseWhy = new RootCauseWhy();
        const planNum = self.selectedRecord.Title();
        const actionNumber = self.RootCauseWhy().length ? self.RootCauseWhy().length + 1 : 1;
        const title = `${planNum}-${actionNumber}`;
        rootCauseWhy.Title.Value(title);
        rootCauseWhy.Number.Value(actionNumber);
        const form = NewForm({
          entity: rootCauseWhy
        });
        const options = {
          title: "New Why",
          form,
          dialogReturnValueCallback: OnCallbackFormRefresh
        };
        showModalDialog(options);
      },
      editWhy: async function(why) {
        const rootCauseWhy = await appContext.RootCauseWhys.FindById(why.ID);
        const form = EditForm({ entity: rootCauseWhy });
        const options = {
          title: "Edit Why",
          form,
          dialogReturnValueCallback: OnCallbackFormRefresh
        };
        showModalDialog(options);
      },
      editWhyDeprecated: function(why) {
        var args = {
          id: why.ID
        };
        app.listRefs.Whys.showModal(
          "EditForm.aspx",
          "Edit Question",
          args,
          OnCallbackFormRefresh
        );
      },
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
          self.selectedRecord.ProcessStageKey()
        ) >= 0) {
          return true;
        }
        return false;
      }),
      determination: ko.observable(),
      edit: function() {
        self.section.RootCause.isEditing(true);
        self.section.RootCause.determination(
          self.selectedRecord.RootCauseDetermination()
        );
      },
      cancel: function() {
        self.section.RootCause.isEditing(false);
      },
      save: function() {
        var valuepair = [
          ["RootCauseDetermination", self.section.RootCause.determination()]
        ];
        self.section.RootCause.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      }
    },
    SimilarNonconformity: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function() {
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
          self.selectedRecord.ProcessStageKey()
        ) >= 0) {
          return true;
        }
        return false;
      }),
      edit: function() {
        self.section.SimilarNonconformity.isEditing(true);
        self.section.SimilarNonconformity.otherOfficeBool(
          self.selectedRecord.SimilarNoncomformityBool()
        );
        self.section.SimilarNonconformity.explanation(
          self.selectedRecord.SimilarNoncomformityDesc()
        );
      },
      otherOfficeBool: ko.observable(),
      explanation: ko.observable(),
      cancel: function() {
        self.section.SimilarNonconformity.isEditing(false);
      },
      save: function() {
        var valuepair = [
          [
            "SimilarNoncomformityDesc",
            self.section.SimilarNonconformity.explanation()
          ],
          [
            "SimilarNoncomformityBool",
            self.section.SimilarNonconformity.otherOfficeBool()
          ]
        ];
        self.section.SimilarNonconformity.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      }
    },
    SupportDocs: {
      allowUploadSupportDoc: ko.pureComputed(function() {
        if (!self.selectedRecord.Active()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        return [
          "Pending QTM-B Problem Approval",
          "Pending QTM Problem Approval",
          "Developing Action Plan",
          "Implementing Action Plan"
        ].includes(self.selectedRecord.ProcessStage());
      }),
      new: function() {
        const planNum = self.selectedRecord.Title();
        const supportingDocument = new SupportingDocument();
        supportingDocument.Record.Value(planNum);
        supportingDocument.DocType.Value(SUPPORTINGDOCUMENTTYPES.SUPPORT);
        const folderPath = planNum;
        const form = UploadForm({
          entity: supportingDocument,
          folderPath,
          view: SupportingDocument.Views.Edit
        });
        const options = {
          title: "Upload New Supporting Document",
          form,
          dialogReturnValueCallback: m_fnRefresh
        };
        showModalDialog(options);
      },
      view: async function(doc) {
        const supportingDocument = await appContext.SupportingDocuments.FindById(doc.ID);
        const form = DispForm({ entity: supportingDocument });
        const options = {
          title: "View Document",
          form
        };
        showModalDialog(options);
      },
      edit: async function(doc) {
        const supportingDocument = await appContext.SupportingDocuments.FindById(doc.ID);
        const form = EditForm({
          entity: supportingDocument,
          view: SupportingDocument.Views.Edit
        });
        const options = {
          title: "Edit Document",
          form,
          dialogReturnValueCallback: m_fnRefresh
        };
        showModalDialog(options);
      }
    },
    Actions: {
      allowSubmitNewAction: ko.pureComputed(function() {
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        return self.selectedRecord.ProcessStageKey() == "DevelopingActionPlan";
      }),
      completeEnable: function(action) {
        if (![
          "Implementing Action Plan",
          "Pending QSO Plan Approval: Action"
        ].includes(vm.selectedRecord.ProcessStage())) {
          return false;
        }
        if (!vm.selectedRecord.curUserHasRole(ROLES2.ACTIONRESPONSIBLEPERSON)) {
          return false;
        }
        if (action.ImplementationStatus == "In progress") {
          return true;
        }
        return false;
      },
      completeClass: function(action) {
        return action.ImplementationStatus == "Completed" ? "btn-success" : "btn-outline-success";
      },
      completeText: function(action) {
        return action.ImplementationStatus == "Completed" ? "Completed" : "Mark Complete";
      },
      completeClick: function(action) {
        var completionDate = (/* @__PURE__ */ new Date()).toISOString();
        var vp = [
          ["ImplementationDate", completionDate],
          ["ImplementationStatus", "Completed"]
        ];
        app.listRefs.Actions.updateListItem(action.ID, vp, m_fnRefresh);
      },
      new: async function() {
        const planNum = self.selectedRecord.Title();
        const nextActionId = getNextActionId(planNum, self.ActionListItems());
        const action = new Action();
        action.Title.Value(planNum);
        action.ActionID.Value(nextActionId);
        const form = NewForm({
          entity: action,
          view: Action.Views.New,
          onSubmit: () => submitNewAction(null, action)
        });
        const options = {
          title: "New Action",
          form,
          dialogReturnValueCallback: OnActionCreateCallback
        };
        showModalDialog(options);
      },
      isEditable: function(action) {
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (action.ImplementationStatus == ACTIONSTATE.COMPLETED) {
          return false;
        }
        return [
          "DevelopingActionPlan",
          "PlanApprovalQSO",
          "PlanApprovalQSOAction",
          "ImplementingActionPlan"
        ].includes(self.selectedRecord.ProcessStageKey());
      },
      editClick: async function(action) {
        const entity = await appContext.Actions.FindById(action.ID);
        const planId = self.selectedRecord.ID();
        const plan = await appContext.Plans.FindById(planId);
        const form = new EditActionForm({ entity, plan });
        const options = {
          title: "Editing Action " + entity.ActionID.Value(),
          form,
          dialogReturnValueCallback: OnActionEditCallback
        };
        showModalDialog(options);
      },
      requiresApproval: function(action) {
        if (vm.AdminType()) {
          switch (action.ImplementationStatus) {
            case "Requires Approval QTM":
              return vm.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM);
            case "Requires Approval QAO":
              return vm.selectedRecord.curUserHasRole(ROLES2.QAO);
            case "Requires Approval QSO":
              return vm.selectedRecord.curUserHasRole(ROLES2.QSO);
            default:
              return false;
          }
        }
        return false;
      },
      approvalApproveClick: function(action) {
        const valuePair = [
          ["ImplementationStatus", "In progress"],
          ["PreviousActionDescription", ""],
          ["PreviousActionResponsiblePerson", ""],
          ["PreviousTargetDate", null]
        ];
        app.listRefs.Actions.updateListItem(action.ID, valuePair, function() {
          app.listRefs.Actions.getListItems("", vm.allActionsArray);
          vm.controls.record.updateImplementationDate();
          m_fnRefresh();
        });
      },
      approvalRejectClick: function(action) {
        const valuePair = [
          ["ImplementationStatus", "In progress"],
          ["PreviousActionDescription", ""],
          ["PreviousActionResponsiblePerson", ""],
          ["PreviousTargetDate", null],
          ["RevisionCount", action.RevisionCount - 1]
        ];
        if (action.PreviousActionDescription) {
          valuePair.push([
            "ActionDescription",
            action.PreviousActionDescription
          ]);
        }
        if (action.PreviousActionResponsiblePerson) {
          valuePair.push([
            "ActionResponsiblePerson",
            action.PreviousActionResponsiblePerson.get_lookupId()
          ]);
        }
        if (action.PreviousTargetDate) {
          valuePair.push([
            "TargetDate",
            new Date(action.PreviousTargetDate).toISOString()
          ]);
        }
        app.listRefs.Actions.updateListItem(action.ID, valuePair, function() {
          app.listRefs.Actions.getListItems("", vm.allActionsArray);
          vm.controls.record.updateImplementationDate();
          m_fnRefresh();
        });
      },
      changesClick: function(action) {
        app.listRefs.Actions.showModal(
          "ChangeForm.aspx",
          action.Title,
          {
            id: action.ID
          },
          function() {
          }
        );
      },
      historyClick: function(action) {
        app.listRefs.Actions.showVersions(
          action.ID,
          action.Title,
          function() {
          }
        );
      },
      findLastActionTargetDate: function() {
        let actionItems = vm.allActionsArray().filter(function(action) {
          return action.Title == vm.selectedRecord.Title();
        });
        let maxDate = /* @__PURE__ */ new Date(0);
        actionItems.forEach(function(action) {
          console.log("Action Item Date: " + action.TargetDate);
          const tempDate = action.TargetDate;
          if (tempDate.getTime() > maxDate.getTime()) {
            console.log(
              "Updating Target Implementation Date: " + action.TargetDate
            );
            maxDate = tempDate;
          }
        });
        return maxDate;
      },
      extendTargetDate: function(actionArr, days) {
        actionArr.forEach(function(action) {
          if (action.ImplementationStatus != ACTIONSTATE.INPROGRESS) {
            return;
          }
          var newNextDate = Common.Utilities.incrementDateDays(
            action.TargetDate,
            days
          );
          var valuePair = [["TargetDate", newNextDate]];
          app.listRefs.Actions.updateListItem(
            action.ID,
            valuePair,
            function() {
            }
          );
        });
      }
    },
    EffectivenessDocs: {
      ShowEffectivenessDocs: ko.pureComputed(function() {
        return [
          "Pending Effectiveness Submission",
          "Pending Effectiveness Submission: Rejected",
          "Pending QSO Effectiveness Approval",
          "Pending QTM-B Effectiveness Approval",
          "Pending QTM Effectiveness Approval",
          "Accepted",
          "Closed: Accepted",
          "Closed: Rejected",
          "Closed: Closed by Submitter"
        ].indexOf(self.selectedRecord.ProcessStage()) > -1;
      }),
      isEditable: function() {
        return [
          "EffectivenessSubmission",
          "EffectivenessSubmissionRejected"
        ].includes(self.selectedRecord.ProcessStageKey());
      },
      officeRisk: {
        isEditing: ko.observable(false),
        editClick: function() {
          self.section.EffectivenessDocs.officeRisk.isEditing(true);
          self.section.EffectivenessDocs.officeRisk.description(
            self.selectedRecord.OfficeImpactDesc()
          );
          self.section.EffectivenessDocs.officeRisk.bool(
            self.selectedRecord.OfficeImpactBool()
          );
        },
        saveClick: function() {
          self.section.EffectivenessDocs.officeRisk.isEditing(false);
          var vp = [
            [
              "OfficeImpactDesc",
              self.section.EffectivenessDocs.officeRisk.description()
            ],
            [
              "OfficeImpactBool",
              self.section.EffectivenessDocs.officeRisk.bool()
            ]
          ];
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            vp,
            m_fnRefresh
          );
        },
        cancelClick: function() {
          self.section.EffectivenessDocs.officeRisk.isEditing(false);
        },
        description: ko.observable(),
        bool: ko.observable()
      },
      proof: {
        isEditing: ko.observable(false),
        editClick: function() {
          self.section.EffectivenessDocs.proof.isEditing(true);
          self.section.EffectivenessDocs.proof.description(
            self.selectedRecord.EffectivenessDescription()
          );
        },
        cancelClick: function() {
          self.section.EffectivenessDocs.proof.isEditing(false);
        },
        saveClick: function() {
          self.section.EffectivenessDocs.proof.isEditing(false);
          var vp = [
            [
              "EffectivenessDescription",
              self.section.EffectivenessDocs.proof.description()
            ]
          ];
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            vp,
            m_fnRefresh
          );
        },
        description: ko.observable(),
        documents: {
          allowUploadEffectivenessDoc: ko.pureComputed(function() {
            return self.selectedRecord.ProcessStageKey() == "ImplementingActionPlan" && vm.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR);
          }),
          new: function() {
            const planNum = self.selectedRecord.Title();
            const supportingDocument = new SupportingDocument();
            supportingDocument.Record.Value(planNum);
            supportingDocument.DocType.Value(
              SUPPORTINGDOCUMENTTYPES.EFFECTIVENESS
            );
            const folderPath = planNum;
            const form = UploadForm({
              entity: supportingDocument,
              folderPath,
              view: SupportingDocument.Views.Edit
            });
            const options = {
              title: "Upload New Proof of Effectiveness Document",
              form,
              dialogReturnValueCallback: m_fnRefresh
            };
            showModalDialog(options);
          },
          view: async function(doc) {
            const supportingDocument = await appContext.SupportingDocuments.FindById(doc.ID);
            const form = DispForm({ entity: supportingDocument });
            const options = {
              title: "View Document",
              form
            };
            showModalDialog(options);
          },
          edit: async function(doc) {
            const supportingDocument = await appContext.SupportingDocuments.FindById(doc.ID);
            const form = EditForm({
              entity: supportingDocument,
              view: SupportingDocument.Views.Edit
            });
            const options = {
              title: "Edit Document",
              form,
              dialogReturnValueCallback: m_fnRefresh
            };
            showModalDialog(options);
          }
        }
      }
    }
  };
  self.selectedPlan = ko.observable();
  self.selectedRecord = Common.Utilities.observableObjectFromListDef(CIItemListDef);
  self.selectedRecord.ProcessStageKey = ko.pureComputed(function() {
    if (!self.selectedRecord.ProcessStage()) {
      return "";
    }
    var stageKey = Object.keys(stageDescriptions).find(function(key) {
      return stageDescriptions[key].stage == self.selectedRecord.ProcessStage();
    });
    return stageKey;
  });
  self.selectedRecord.ProcessStageObj = ko.pureComputed(function() {
    var key = self.selectedRecord.ProcessStageKey();
    if (!key) return null;
    return stageDescriptions[key];
  });
  self.selectedRecord.curUserHasRole = function(role) {
    var userId = self.currentUserObj.id();
    switch (vm.AdminType()) {
      case ROLES2.ADMINTYPE.QTM:
        return true;
      case ROLES2.ADMINTYPE.QTMB:
        if (role != ROLES2.ADMINTYPE.QTM) {
          return self.selectedRecord.CGFSLocation() == "Bangkok";
        }
      case ROLES2.ADMINTYPE.USER:
        switch (role) {
          case ROLES2.IMPLEMENTOR:
            if (self.selectedRecord.curUserHasRole(ROLES2.COORDINATOR)) {
              return true;
            }
            if (self.selectedRecord.curUserHasRole(ROLES2.SUBMITTER) && self.selectedRecord.SelfInitiated() == "Yes") {
              return true;
            }
            return false;
          case ROLES2.SUBMITTER:
            return self.selectedRecord.Author.containsPeopleById(userId) ? true : false;
          case ROLES2.COORDINATOR:
            return self.selectedRecord.ProblemResolverName.containsPeopleById(
              userId
            ) ? true : false;
          case ROLES2.ACTIONRESPONSIBLEPERSON:
            if (self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
              return true;
            }
            return self.ActionListItems().filter(function(actionItem) {
              return userId === actionItem.ActionResponsiblePerson.get_lookupId();
            }).length > 0;
          default:
            return false;
        }
        break;
      case ROLES2.ADMINTYPE.QO:
        if (![ROLES2.QSO, ROLES2.QAO, ROLES2.IMPLEMENTOR].includes(role)) {
          return false;
        }
        if (vm.selectedRecord.QAO.containsPeopleById(userId)) {
          return true;
        }
        if (role === ROLES2.QSO && vm.selectedRecord.QSO.containsPeopleById(userId)) {
          return true;
        }
        var isRoleFlag = false;
        self.currentUserObj.businessOfficeOwnership().some(function(office) {
          if (office.id === self.selectedRecord.BusinessOffice().get_lookupId()) {
            if (office.type === role || office.type === ROLES2.QAO) {
              isRoleFlag = true;
              return true;
            }
          }
        });
        return isRoleFlag;
      default:
        return false;
    }
  };
  self.CAPID = ko.observable();
  self.GetNumActionsApproval = ko.computed(function() {
    return self.ActionListItems().filter(function(action) {
      return action.ImplementationStatus == "Requires Approval";
    }).length;
  });
  self.contactQTM = ko.computed(function() {
    const qtmEmail = "CGFSQMSCARCAP@state.gov";
    const link = "mailto:" + qtmEmail + "?subject=CAR/CAP Record Remark&body=Greetings,%0d%0a%0d%0aI have a remark regarding the following CAR/CAP: " + self.selectedTitle() + "%0d%0a%0d%0aMy remark is as follows:%0d%0a";
    return link;
  });
  self.printUrl = ko.computed(function() {
    if (!self.selectedTitle()) {
      return "javascript: void(0)";
    }
    return _spPageContextInfo.siteServerRelativeUrl + "/SitePages/print.aspx?capid=" + self.selectedTitle();
  });
  self.clickPrintPlan = () => {
    printPlan(self.selectedRecord.ID());
  };
  self.ProcessPercentage = ko.computed(function() {
    return self.selectedRecord.ProcessStageObj() && self.selectedRecord.ProcessStageObj().progress;
  });
  self.downloadDocument = function(doc) {
    return null;
  };
  self.NumActions = ko.computed(function() {
    return self.ActionListItems().length ? self.ActionListItems().length : 0;
  });
  self.NumOpenActions = ko.computed(function() {
    return self.NumActions() > 0 ? self.ActionListItems().filter(checkComplete).length : 0;
  });
  self.NumClosedActions = ko.computed(function() {
    return self.NumActions() - self.NumOpenActions();
  });
  self.ActionPercentage = ko.computed(function() {
    const perc = 1 - self.NumOpenActions() / self.ActionListItems().length || 0;
    return perc * 100 + "%";
  });
  self.ActionProgressBarClass = ko.computed(function() {
    return self.ActionPercentage() == "100%" ? "bg-success" : "bg-info";
  });
  self.RootCauseWhy = ko.observableArray([]);
  self.IsCAR = ko.computed(function() {
    return self.selectedRecord.RecordType() == "CAR";
  });
  self.controls = {
    pipeline: {
      showStage1: ko.pureComputed(function() {
        var record = self.selectedRecord;
        return record.ProcessStageObj().stageNum === 1 && record.curUserHasRole(record.ProcessStageObj().actionTaker);
      }),
      showStage2: ko.pureComputed(function() {
        var record = self.selectedRecord;
        return record.ProcessStageObj().stageNum === 2 && record.curUserHasRole(record.ProcessStageObj().actionTaker);
      }),
      showStage3: ko.pureComputed(function() {
        var record = self.selectedRecord;
        return record.ProcessStageObj().stageNum === 3 && record.curUserHasRole(record.ProcessStageObj().actionTaker);
      }),
      showStage4: ko.pureComputed(function() {
        var record = self.selectedRecord;
        return record.ProcessStageObj().stageNum === 4 && record.curUserHasRole(record.ProcessStageObj().actionTaker);
      })
    }
  };
  const sortByCreatedDesc = function(item1, item2) {
    return item1.Created < item2.Created ? 1 : -1;
  };
  const sortByTitle2 = function(item1, item2) {
    if (!item1.Title) {
      return -1;
    }
    if (!item2.Title) {
      return 1;
    }
    var index1 = parseInt(item1.Title.split("-")[1]);
    var index2 = parseInt(item2.Title.split("-")[1]);
    return index1 < index2 ? 1 : -1;
  };
  const getNextItemCntByType = function(type) {
    const records = vm.allRecordsArray().filter(function(record) {
      return record.RecordType == type && record.Created.getFullYear() == (/* @__PURE__ */ new Date()).getFullYear() && record.Title;
    });
    return records.length + 1;
  };
  function GetNewID(type, count) {
    var id2 = type + (/* @__PURE__ */ new Date()).format("yy") + "-" + count.toString().padStart(3, "0");
    return id2;
  }
  const getNextTitleByType = function(type) {
    const itemCount = getNextItemCntByType(type);
    switch (type) {
      case "CAR":
        return GetNewID("C", itemCount);
      case "CAP":
        return GetNewID("P", itemCount);
      default:
    }
  };
  self.controls.record = {
    new: function() {
      var cntCap = getNextItemCntByType("CAP");
      var cntCar = getNextItemCntByType("CAR");
      var args = {
        cnt: { cap: cntCap, car: cntCar }
      };
      app.listRefs.Plans.showModal(
        "NewForm.aspx",
        "Create a New CAP or CAR",
        args,
        (result, value) => {
          if (result === SP.UI.DialogResult.OK) {
            const refreshTask = addTask(tasks.refreshPlans);
            const userId = vm.currentUserObj.id();
            app.listRefs.Plans.getListItems("", function(items) {
              vm.allRecordsArray(items);
              const newPlan = items.findLast(
                (item) => item.Author.get_lookupId() == userId
              );
              const newTitle = getNextTitleByType(newPlan.RecordType);
              if (newTitle != newPlan.Title) {
                newPlan.Title = newTitle;
                app.listRefs.Plans.updateListItem(
                  newPlan.ID,
                  [["Title", newTitle]],
                  () => {
                  }
                );
              }
              vm.selectedTitle(newPlan.Title);
              vm.tabs.selectById(vm.tabOpts.detail);
              finishTask(refreshTask);
            });
          }
        }
      );
    },
    isEditable: ko.pureComputed(function() {
      if (!vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM)) {
        return true;
      }
      if (self.selectedRecord.SelfInitiated() == "No" && self.selectedRecord.curUserHasRole(ROLES2.SUBMITTER)) {
        if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return ["Editing", "Pending QTM-B Problem Approval"].includes(
            self.selectedRecord.ProcessStage()
          );
        }
        return [
          "Editing",
          "Pending QTM-B Problem Approval",
          "Pending QTM Problem Approval"
        ].includes(self.selectedRecord.ProcessStage());
      }
      return false;
    }),
    edit: async function() {
      const id2 = self.selectedRecord.ID();
      const entity = await appContext.Plans.FindById(id2);
      let formView, submitView;
      if (self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM)) {
        formView = Plan.Views.QTMEditForm;
        submitView = Plan.Views.QTMEditSubmit;
      } else {
        formView = Plan.Views.SubmitterEditForm;
        submitView = Plan.Views.SubmitterEditSubmit;
      }
      const form = EditForm({
        entity,
        view: formView,
        onSubmit: () => editPlan(entity, submitView)
      });
      const options = {
        title: `Editing ${entity.Title}`,
        form,
        dialogReturnValueCallback: OnCallbackFormRefresh
      };
      showModalDialog(options);
    },
    view: async function() {
      const id2 = self.selectedRecord.ID();
      const plan = await appContext.Plans.FindById(id2);
      const planViewForm = DispForm({
        entity: plan,
        view: Plan.Views.View
      });
      const options = {
        title: "View Plan " + plan.Title,
        form: planViewForm
      };
      showModalDialog(options);
    },
    isCloseable: ko.pureComputed(function() {
      if (!vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM)) {
        return true;
      }
      if (self.selectedRecord.SelfInitiated() == "No" && self.selectedRecord.curUserHasRole(ROLES2.SUBMITTER)) {
        if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return ["Editing", "Pending QTM-B Problem Approval"].includes(
            self.selectedRecord.ProcessStage()
          );
        }
        return ["Editing", "Pending QTM Problem Approval"].includes(
          self.selectedRecord.ProcessStage()
        );
      }
      if (self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
        return [
          "Editing",
          "Developing Action Plan",
          "Pending QSO Plan Approval"
        ].includes(self.selectedRecord.ProcessStage());
      }
      return false;
    }),
    displayCloseDialog: async function() {
      const planId = self.selectedPlan()?.ID;
      const plan = await appContext.Plans.FindById(planId);
      const form = new CancelPlanForm({ entity: plan });
      const options = {
        title: "Are you sure you want to close this plan?",
        form,
        dialogReturnValueCallback: OnCallbackFormRefresh
      };
      showModalDialog(options);
    },
    isOpenable: ko.pureComputed(function() {
      if (vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM)) {
        return true;
      }
      return false;
    }),
    open: function() {
      if (confirm("Are you sure you want to Re-Open this record?")) {
        const openTask = addTask(tasks.opening);
        const valuePair = [
          ["ProcessStage", vm.selectedRecord.PreviousStage()],
          ["Active", "1"],
          ["CloseDate", null],
          ["CancelReason", null]
        ];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          function() {
            finishTask(openTask);
            m_fnRefresh();
          }
        );
      }
    },
    extension: {
      showExtensionRequestSection: function() {
        if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
          return false;
        }
        if (self.selectedRecord.ProcessStageKey() != "ImplementingActionPlan") {
          return false;
        }
        return true;
      },
      requestExtension: function() {
        var valuePair = [["ExtensionRequested", true]];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          m_fnRefresh
        );
      },
      cancelRequest: function() {
        var valuePair = [["ExtensionRequested", false]];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          m_fnRefresh
        );
      },
      extensionApprover: ko.pureComputed(function() {
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        if (isNaN(extCnt)) {
          extCnt = 0;
        }
        if (extCnt == 0) {
          return "QSO";
        }
        if (extCnt == 1) {
          return "QAO";
        }
        if (extCnt >= 2) {
          return "QTM";
        }
      }),
      showApproval: ko.pureComputed(function() {
        if (!self.selectedRecord.ExtensionRequested()) {
          return false;
        }
        if (!self.selectedRecord.Active()) {
          return false;
        }
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        extCnt = isNaN(extCnt) ? 0 : extCnt;
        if (extCnt == 0) {
          return self.selectedRecord.curUserHasRole(ROLES2.QSO);
        }
        if (extCnt == 1) {
          return self.selectedRecord.curUserHasRole(ROLES2.QAO);
        }
        if (extCnt >= 2) {
          return self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM);
        }
        return false;
      }),
      approveRequest: function() {
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        if (isNaN(extCnt)) {
          extCnt = 0;
        }
        self.selectedRecord.ExtensionCount(++extCnt);
        var newNextDate = self.controls.record.extension.totalExtensionDate(
          vm.section.Actions.findLastActionTargetDate()
        );
        var valuePair = [
          ["ExtensionRequested", false],
          ["ExtensionCount", extCnt],
          ["NextTargetDate", newNextDate.toISOString()],
          ["ImplementationTargetDate", newNextDate.toISOString()]
        ];
        self.section.Actions.extendTargetDate(
          vm.ActionListItems(),
          EXTENSIONDAYS
        );
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          m_fnRefresh
        );
      },
      totalExtensionDate: function(startDate) {
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        if (isNaN(extCnt)) {
          extCnt = 0;
        }
        var newNextDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + EXTENSIONDAYS * extCnt
        );
        return newNextDate;
      }
    },
    showCalculateNextTargetDate: ko.pureComputed(function() {
      if (!vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES2.ADMINTYPE.QTM)) {
        return true;
      }
      return false;
    }),
    calculateNextTargetDate: function() {
      if (!vm.selectedRecord.Active()) {
        alert("Record is not active!");
        return;
      }
      let nextTargetDate = /* @__PURE__ */ new Date();
      let startDate = /* @__PURE__ */ new Date();
      switch (vm.selectedRecord.ProcessStageObj().stageNum) {
        case 1:
          startDate = vm.selectedRecord.Created.date();
          nextTargetDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 30
          );
          break;
        case 2:
          if (self.selectedRecord.SelfInitiated() == "No") {
            startDate = vm.selectedRecord.QTMProblemAdjudicationDate.date();
          } else {
            startDate = vm.selectedRecord.Created.date();
          }
          nextTargetDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 30
          );
          break;
        case 3:
          nextTargetDate = vm.selectedRecord.ImplementationTargetDate.date();
          break;
        case 4:
          nextTargetDate = vm.selectedRecord.EffectivenessVerificationTargetD.date();
          console.log("4");
          break;
        default:
          alert("Something went wrong");
      }
      console.log(nextTargetDate.toISOString());
      let valuePair = [["NextTargetDate", nextTargetDate.toISOString()]];
      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        m_fnRefresh
      );
    },
    updateImplementationDate: function() {
      if (vm.selectedRecord.ProcessStageKey() != "DevelopingActionPlan" && vm.AdminType() != ROLES2.ADMINTYPE.QTM) {
        return;
      }
      let maxDate = vm.section.Actions.findLastActionTargetDate();
      maxDate = vm.controls.record.extension.totalExtensionDate(maxDate);
      const valuePair = [["ImplementationTargetDate", maxDate.toISOString()]];
      console.log(valuePair);
      var planId = vm.selectedRecord.ID();
      app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
    }
  };
  self.controls.showSectionByStageKey = function(stage) {
    return ko.pureComputed(function() {
      if (self.selectedRecord.ProcessStageKey() != stage) {
        return false;
      }
      if (!self.selectedRecord.curUserHasRole(
        stageDescriptions[stage].actionTaker
      )) {
        return false;
      }
      return true;
    });
  };
  self.controls.showSectionByStageNum = function(stageNum) {
    return ko.pureComputed(function() {
      if (self.selectedRecord.ProcessStageObj().stageNum < stageNum) {
        return false;
      }
      return true;
    });
  };
  self.controls.rejectStage = function() {
    const plan = ko.unwrap(self.selectedPlan);
    const rejection = new Rejection();
    rejection.Title.Value(plan.Title.Value());
    rejection.Active.Value(true);
    rejection.Rejector.Value(currentUser.Title);
    const currentStage = plan.ProcessStage.Value();
    rejection.Stage.Value(currentStage);
    const rejectionId = plan.Title.Value() + "-R" + String(self.Rejections().length).padStart(2, "0");
    rejection.RejectionId.Value(rejectionId);
    const form = NewForm({
      entity: rejection,
      view: Rejection.Views.New
    });
    const options = {
      title: "New Rejection",
      form,
      dialogReturnValueCallback: (result) => self.controls.rejectStageSubmit(result, plan, rejection)
    };
    showModalDialog(options);
  };
  self.controls.rejectStageSubmit = async function(result, plan, rejection) {
    if (result !== SP.UI.DialogResult.OK) {
      return;
    }
    let next = null;
    switch (self.selectedRecord.ProcessStageKey()) {
      case "ProblemApprovalQSO":
        next = m_fnRejectProblemQSO;
        break;
      case "ProblemApprovalQAO":
        next = m_fnRejectProblemQAO;
        break;
      case "ProblemApprovalQTM":
        next = m_fnRejectProblemQTM;
        break;
      case "ProblemApprovalQTMB":
        next = m_fnRejectProblemQTMB;
        break;
      case "PlanApprovalQSO":
        next = m_fnRejectPlanQSO;
        break;
      case "PlanApprovalQTMB":
        next = m_fnRejectPlanQTMB;
        break;
      case "PlanApprovalQTM":
        next = m_fnRejectPlanQTM;
        break;
      case "ImplementationApproval":
        next = m_fnRejectImplement;
        break;
      case "EffectivenessApprovalQSO":
        next = m_fnRejectEffectivenessQSO;
        break;
      case "EffectivenessApprovalQTM":
        next = m_fnRejectEffectivenessQTM;
        break;
      case "EffectivenessApprovalQTMB":
        next = m_fnRejectEffectivenessQTMB;
        break;
    }
    if (!next) return;
    const rejectionTask = addTask(tasks.reject(plan.Title.Value()));
    await new Promise(next);
    await onStageRejectedCallback(plan, rejection);
    finishTask(rejectionTask);
  };
  self.rejectReason = ko.observable();
  self.effectivenessRejectReason = ko.observable();
  self.controls.stage1 = {
    problemApproveQTM: m_fnApproveProblemQTM,
    problemApproveQTMB: m_fnApproveProblemQTMB,
    problemApproveQSO: m_fnApproveProblemQSO,
    problemApproveQAO: m_fnApproveProblemQAO
  };
  self.controls.stage2 = {
    enableSubmitActionPlan: ko.pureComputed(function() {
      if (!self.controls.showSectionByStageKey("DevelopingActionPlan")()) {
        return false;
      }
      if (self.validateStage.stage2.Actions()) {
        return false;
      }
      if (self.validateStage.stage2.RootCause()) {
        return false;
      }
      if (self.validateStage.stage2.RootCauseWhy()) {
        return false;
      }
      if (self.validateStage.stage2.Nonconformity()) {
        return false;
      }
      if (self.validateStage.stage2.ContainmentAction()) {
        return false;
      }
      return true;
    }),
    showSubmitActionPlan: ko.pureComputed(function() {
      return self.selectedRecord.ProcessStageKey() == "DevelopingActionPlan";
    }),
    submitActionPlan: function() {
      var valuePair = [
        ["ProcessStage", stageDescriptions.PlanApprovalQSO.stage],
        ["SubmittedDate", (/* @__PURE__ */ new Date()).toISOString()]
      ];
      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        onStageApprovedCallback
      );
    },
    planApproveQSO: function() {
      m_fnApprovePlanQSO(self.selectedRecord.ID());
    },
    planRejectQSO: function() {
      m_fnRejectPlanQSO(self.selectedRecord.ID());
    },
    planApproveQTMB: function() {
      m_fnApprovePlanQTMB(self.selectedRecord.ID());
    },
    planRejectQTMB: function() {
      m_fnRejectPlanQTMB(self.selectedRecord.ID());
    },
    planApproveQTM: function() {
      m_fnApprovePlanQTM(self.selectedRecord.ID());
    },
    planRejectQTM: function() {
      m_fnRejectPlanQTM(self.selectedRecord.ID());
    }
  };
  self.controls.stage3 = {
    targetVerificationDate: new DateField({
      displayName: "Effectiveness Verification Target Date"
    }),
    enableImplementingActionPlan: ko.pureComputed(function() {
      if (self.validateStage.stage3.CompleteActions()) {
        return false;
      }
      if (self.validateStage.stage3.VerificationTargetDate()) {
        return false;
      }
      return true;
    }),
    submitImplementActionPlan: function() {
      var valuePair = [
        ["ProcessStage", stageDescriptions.ImplementationApproval.stage],
        [
          "EffectivenessVerificationTargetD",
          self.controls.stage3.targetVerificationDate.get()
        ],
        ["SubmittedImplementDate", (/* @__PURE__ */ new Date()).toISOString()]
      ];
      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        onStageApprovedCallback
      );
    },
    implementationApproveQSO: m_fnApproveImplement
  };
  self.controls.stage4 = {
    descOrDocWarningClass: function() {
      return self.validateStage.stage4.DescOrDoc() ? "alert-warning" : "alert-info";
    },
    enableOfficeImpactBool: function() {
      return vm.selectedRecord.ProcessStageKey() == "EffectivenessSubmission" || vm.selectedRecord.ProcessStageKey() == "EffectivenessSubmissionRejected";
    },
    enableEffectivenessSubmit: function() {
      if (self.validateStage.stage4.OfficeImpact()) {
        return false;
      }
      if (self.validateStage.stage4.EffectivenessDocs() && self.validateStage.stage4.EffectivenessDescription()) {
        return false;
      }
      return true;
    },
    showEffectivenessSubmit: ko.pureComputed(function() {
      if (self.selectedRecord.ProcessStageKey() != "EffectivenessSubmission" && self.selectedRecord.ProcessStageKey() != "EffectivenessSubmissionRejected") {
        return false;
      }
      if (!self.selectedRecord.curUserHasRole(ROLES2.IMPLEMENTOR)) {
        return false;
      }
      return true;
    }),
    submitEffectiveness: function() {
      var valuePair = [
        ["ProcessStage", stageDescriptions.EffectivenessApprovalQSO.stage],
        ["SubmittedEffectivenessDate", (/* @__PURE__ */ new Date()).toISOString()]
      ];
      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        onStageApprovedCallback
      );
    },
    effectivenessApproveQSO: m_fnApproveEffectivenessQSO,
    effectivenessApproveQTM: m_fnApproveEffectivenessQTM,
    effectivenessApproveQTMB: m_fnApproveEffectivenessQTMB
  };
  self.validateStage = {
    stage1: {
      ProblemResolver: ko.pureComputed(function() {
        return self.selectedRecord.ProblemResolverName.ensuredPeople().length === 0;
      })
    },
    stage2: {
      Actions: ko.computed(function() {
        return !self.ActionListItems().length;
      }),
      RootCause: ko.computed(function() {
        return !self.selectedRecord.RootCauseDetermination() && self.selectedRecord.RecordType() == "CAR";
      }),
      RootCauseWhy: ko.computed(function() {
        if (self.selectedRecord.RecordType() == "CAP") {
          return false;
        } else if (!self.RootCauseWhy().length) {
          return true;
        } else {
          return self.RootCauseWhy().length < 1;
        }
      }),
      Nonconformity: ko.computed(function() {
        return !self.selectedRecord.SimilarNoncomformityDesc() && self.selectedRecord.RecordType() == "CAR";
      }),
      ContainmentAction: ko.computed(function() {
        return !self.selectedRecord.ContainmentAction() && self.selectedRecord.RecordType() == "CAR";
      }),
      AddProblemResolver: ko.computed(function() {
        return self.selectedRecord.RecordType() == "CAR" && !self.selectedRecord.ProblemResolverName.ensuredPeople().length && [
          "ProblemApprovalQSO",
          "ProblemApprovalQAO",
          "PlanApprovalQSO"
        ].indexOf(self.selectedRecord.ProcessStageKey()) >= 0;
      })
    },
    stage3: {
      CompleteActions: ko.pureComputed(function() {
        return self.NumOpenActions() > 0;
      }),
      VerificationTargetDate: ko.pureComputed(function() {
        return !self.controls.stage3.targetVerificationDate.Value();
      }),
      AddSupportDoc: ko.pureComputed(function() {
        return !self.SupportDocuments().length;
      })
    },
    stage4: {
      EffectivenessDocs: ko.pureComputed(function() {
        return self.EffectivenessDocuments().length == 0;
      }),
      EffectivenessDescription: ko.pureComputed(function() {
        return !self.selectedRecord.EffectivenessDescription();
      }),
      DescOrDoc: ko.pureComputed(function() {
        return self.validateStage.stage4.EffectivenessDocs() && self.validateStage.stage4.EffectivenessDescription();
      }),
      OfficeImpact: ko.pureComputed(function() {
        return !self.selectedRecord.OfficeImpactDesc();
      })
    }
  };
  self.Rejections = ko.observableArray();
  self.highlightOverdue = function(record) {
    const targetDate = record.NextTargetDate !== "undefined" && record.NextTargetDate ? new Date(record.NextTargetDate) : null;
    let today = new Date((/* @__PURE__ */ new Date()).toDateString());
    let twoWeeks = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 14
    );
    if (!targetDate || record.Active == "0") {
      return "white";
    } else if (targetDate < today) {
      return "#d72626";
    } else if (targetDate < twoWeeks) {
      return "#f3e44b";
    }
  };
  self.formatNextTargetDate = function(record) {
    if (record == void 0) {
      return "N/A";
    }
    if (record.Active == "0") {
      return "N/A";
    }
    if (typeof record.NextTargetDate !== "undefined" && record.NextTargetDate) {
      return new Date(record.NextTargetDate).format("yyyy-MM-dd").toString();
    }
    return "N/A";
  };
  self.formatDocDownloadLink = function(link) {
    return "../_layouts/download.aspx?SourceUrl=" + link;
  };
  self.onNewPlanCreated = function(result, args) {
    if (result !== SP.UI.DialogResult.OK) {
      return;
    }
    const refreshTask = addTask(tasks.refreshPlans);
    const userId = vm.currentUserObj.id();
    app.listRefs.Plans.getListItems("", function(items) {
      vm.allRecordsArray(items);
      const newPlan = items.findLast(
        (item) => item.Author.get_lookupId() == userId
      );
      const newTitle = getNextTitleByType(newPlan.RecordType);
      if (newTitle != newPlan.Title) {
        newPlan.Title = newTitle;
        app.listRefs.Plans.updateListItem(
          newPlan.ID,
          [["Title", newTitle]],
          async () => {
            const notificationTask = addTask(tasks.notification());
            const plan = await appContext.Plans.FindById(newPlan.ID);
            vm.selectedPlan(plan);
            await stageApprovedNotification(plan);
            finishTask(notificationTask);
          }
        );
      }
      vm.selectedTitle(newPlan.Title);
      vm.tabs.selectTab(vm.tabOpts.detail);
      finishTask(refreshTask);
    });
  };
}
var App = class _App {
  constructor() {
    const app2 = new CAPViewModel();
    Object.assign(this, app2);
  }
  appLoadTime = ko.observable();
  clickNewPlan() {
    const plan = new Plan();
    const newPlanForm = new NewPlanForm({});
    const options = {
      title: "Create a new CAR or CAP",
      form: newPlanForm,
      dialogReturnValueCallback: this.onNewPlanCreated
    };
    showModalDialog(options);
  }
  async clickSendStageNotification() {
    const plan = ko.unwrap(vm.selectedPlan);
    await stageApprovedNotification(plan);
  }
  async clickEditPlan() {
    const plan = await appContext.Plans.FindById();
  }
  /******************************** Application Logic ***************************/
  async init() {
    stores: {
      const businessOfficesPromise = appContext.BusinessOffices.ToList().then(
        (offices) => businessOfficeStore(offices.sort(sortByTitle))
      );
      const recordSourcesPromise = appContext.RecordSources.ToList().then(
        (records) => sourcesStore(records.sort(sortByTitle))
      );
      await Promise.all([businessOfficesPromise, recordSourcesPromise]);
    }
  }
  static async Create() {
    const app2 = new _App();
    await app2.init();
    return app2;
  }
};
window.vm = {};
if (document.readyState === "ready" || document.readyState === "complete") {
  initApp();
} else {
  document.onreadystatechange = () => {
    if (document.readyState === "complete" || document.readyState === "ready") {
      ExecuteOrDelayUntilScriptLoaded(function() {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", initApp);
      }, "sp.js");
    }
  };
}
export {
  CAPViewModel
};
//# sourceMappingURL=app.js.map
