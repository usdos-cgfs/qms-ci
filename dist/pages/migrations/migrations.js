// src/constants.js
var html = String.raw;
var ROLES = {
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
var stageDescriptions = {
  Editing: {
    stage: "Editing",
    description: "CAR has been rejected by Quality Owner, to be closed by QTM.",
    stageNum: 1,
    progress: "5%"
  },
  ProblemApprovalQTMB: {
    actionTaker: ROLES.ADMINTYPE.QTMB,
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
    actionTaker: ROLES.ADMINTYPE.QTM,
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
    actionTaker: ROLES.QSO,
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
    actionTaker: ROLES.QAO,
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
    actionTaker: ROLES.IMPLEMENTOR,
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
    actionTaker: ROLES.QSO,
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
    actionTaker: ROLES.QSO,
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
    actionTaker: ROLES.ADMINTYPE.QTMB,
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
    actionTaker: ROLES.ADMINTYPE.QTM,
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
    actionTaker: ROLES.IMPLEMENTOR,
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
    actionTaker: ROLES.QSO,
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
    actionTaker: ROLES.IMPLEMENTOR,
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
    actionTaker: ROLES.IMPLEMENTOR,
    stage: "Pending Effectiveness Submission: Rejected",
    description: "The user must provide additional proof of effectiveness and re-submit this record.",
    stageNum: 4,
    progress: "75%"
  },
  EffectivenessApprovalQSO: {
    actionTaker: ROLES.QSO,
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
    actionTaker: ROLES.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Effectiveness Approval",
    description: "This record originated in Bangkok, and effectiveness must be approved at QTM-B.",
    stageNum: 4,
    progress: "85%"
  },
  EffectivenessApprovalQTM: {
    actionTaker: ROLES.ADMINTYPE.QTM,
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
var html2 = String.raw;
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
var viewTemplate = html2`
  <div class="fw-semibold" data-bind="text: displayName"></div>
  <div data-bind="text: toString()"></div>
`;
var editTemplate = html2`<div>Uh oh!</div>`;
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
var editTemplate2 = html2`
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
var viewTemplate2 = html2`
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
var editTemplate3 = html2`
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
var viewTemplate3 = html2`
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
var editTemplate4 = html2`
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
var editTemplate5 = html2`
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
var editTemplate6 = html2`
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
var viewTemplate4 = html2`
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
var editTemplate7 = html2`
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
var editTemplate8 = html2`
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
var editTemplate9 = html2`
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
var viewTemplate5 = html2`
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
var editTemplate10 = html2`
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
var html3 = String.raw;

// src/sal/infrastructure/sal.js
window.console = window.console || { log: function() {
} };
var sal = {};
var serverRelativeUrl = _spPageContextInfo.webServerRelativeUrl == "/" ? "" : _spPageContextInfo.webServerRelativeUrl;
sal.globalConfig = sal.globalConfig || {
  siteGroups: [],
  siteUrl: serverRelativeUrl,
  listServices: serverRelativeUrl + "/_vti_bin/ListData.svc/",
  defaultGroups: {}
};
sal.site = sal.site || {};
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
  if (sal.utilities) return;
  console.log("Init Sal");
  var currCtx = SP.ClientContext.get_current();
  var web = currCtx.get_web();
  sal.globalConfig.defaultGroups = {
    owners: web.get_associatedOwnerGroup(),
    members: web.get_associatedMemberGroup(),
    visitors: web.get_associatedVisitorGroup()
  };
  currCtx.load(sal.globalConfig.defaultGroups.owners);
  currCtx.load(sal.globalConfig.defaultGroups.members);
  currCtx.load(sal.globalConfig.defaultGroups.visitors);
  var user = web.get_currentUser();
  currCtx.load(user);
  var siteGroupCollection = web.get_siteGroups();
  currCtx.load(siteGroupCollection);
  sal.globalConfig.roles = [];
  var oRoleDefinitions2 = currCtx.get_web().get_roleDefinitions();
  currCtx.load(oRoleDefinitions2);
  return new Promise((resolve, reject2) => {
    currCtx.executeQueryAsync(
      function() {
        sal.globalConfig.currentUser = user;
        var listItemEnumerator = siteGroupCollection.getEnumerator();
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();
          sal.globalConfig.siteGroups.push(principalToPeople(oListItem));
        }
        var oEnumerator = oRoleDefinitions2.getEnumerator();
        while (oEnumerator.moveNext()) {
          var oRoleDefinition2 = oEnumerator.get_current();
          sal.globalConfig.roles.push(oRoleDefinition2.get_name());
        }
        sal.config = new sal.NewAppConfig();
        sal.utilities = new sal.NewUtilities();
        resolve();
      },
      function(sender, args) {
        alert("Error initializing SAL");
        reject2();
      }
    );
  });
}
sal.NewAppConfig = function() {
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
      if (!sal.globalConfig.roles.includes(roleName)) {
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
sal.NewUtilities = function() {
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
    var group = sal.globalConfig.siteGroups.find(function(group2) {
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
        oList.get_roleAssignments().getByPrincipal(sal.globalConfig.currentUser).deleteObject();
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
      oListItem.get_roleAssignments().getByPrincipal(sal.globalConfig.currentUser).deleteObject();
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
    let builtPath = sal.globalConfig.siteUrl;
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
        return [user.LoginName, sal.config.siteRoles.roles.RestrictedRead];
      });
      await setFolderPermissionsAsync(folderPath, targetPerms, true);
    } catch (e) {
      console.warn(e);
    }
    return;
  }
  async function ensureFolderPermissionsAsync(relFolderPath, targetPerms) {
    const serverRelFolderPath = getServerRelativeFolderPath(relFolderPath);
    const apiEndpoint = sal.globalConfig.siteUrl + `/_api/web/GetFolderByServerRelativeUrl('${serverRelFolderPath}')/ListItemAllFields/RoleAssignments?$expand=Member,Member/Users,RoleDefinitionBindings`;
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
          (curBinding) => sal.config.siteRoles.fulfillsRole(curBinding.Name, targetPerm)
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
      folderUrl = sal.globalConfig.siteUrl + "/Lists/" + self.config.def.name + "/" + path;
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
    var folderUrl = sal.globalConfig.siteUrl + "/Lists/" + self.config.def.name + "/" + path;
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
        folderItem.get_roleAssignments().getByPrincipal(sal.globalConfig.currentUser).deleteObject();
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
      rootFolder = sal.globalConfig.siteUrl + listPath + args.rootFolder;
    }
    var formsPath = self.config.def.isLib ? "/" + self.config.def.name + "/forms/" : "/Lists/" + self.config.def.name + "/";
    Object.assign(options, {
      title,
      dialogReturnValueCallback: callback,
      args: JSON.stringify(args),
      height: 800,
      url: sal.globalConfig.siteUrl + formsPath + formName + "?ID=" + id2 + "&Source=" + location.pathname + "&RootFolder=" + rootFolder
    });
    SP.UI.ModalDialog.showModalDialog(options);
  }
  function showCheckinModal(fileRef, callback) {
    var options = SP.UI.$create_DialogOptions();
    options.title = "Check in Document";
    options.height = "600";
    options.dialogReturnValueCallback = callback;
    options.url = sal.globalConfig.siteUrl + "/_layouts/checkin.aspx?List={" + self.config.guid + "}&FileName=" + fileRef;
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
    return sal.globalConfig.siteUrl + "/_layouts/15/versions.aspx?List={" + self.config.guid + "}&ID=" + itemId;
  }
  function uploadNewDocumentAsync(folderPath, title, args) {
    return new Promise((resolve, reject2) => {
      const currCtx = new SP.ClientContext.get_current();
      const web = currCtx.get_web();
      const oList = web.get_lists().getByTitle(self.config.def.title);
      currCtx.load(oList);
      currCtx.executeQueryAsync(
        function() {
          var siteString = sal.globalConfig.siteUrl == "/" ? "" : sal.globalConfig.siteUrl;
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
  const siteEndpoint = uri.startsWith("http") ? uri : sal.globalConfig.siteUrl + "/_api" + uri;
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

// src/sal/infrastructure/authorization.js
async function getUsersByGroupName(groupName) {
  const users = await getGroupUsers(groupName);
  if (!users) return [];
  return users.map((userProps) => new People(userProps));
}

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

// src/pages/migrations/migrations.js
async function flattenPlan(plan) {
  console.log("Flattening Plan: ", plan.Title.Value());
  const coordinatorName = ko.unwrap(plan.ProblemResolverName.Value)?.Title;
  plan.CoordinatorName.Value(coordinatorName);
  const qaoName = ko.unwrap(plan.QAO.Value)?.Title;
  plan.QAOName.Value(qaoName);
  const qsoName = ko.unwrap(plan.QSO.Value)?.Title;
  plan.QSOName.Value(qsoName);
  const authorName = ko.unwrap(plan.Author.Value)?.Title;
  plan.AuthorName.Value(authorName);
  const result = await appContext.Plans.UpdateEntity(plan, [
    "CoordinatorName",
    "QSOName",
    "QAOName",
    "AuthorName"
  ]);
  console.log("Flattened Plan: ", plan.Title.Value(), result);
}
var App = class _App {
  constructor() {
  }
  async clickMigrate() {
    console.log("fetching plans");
    const allPlans = await appContext.Plans.FindByColumnValue(
      [{ column: "AuthorName", value: null }],
      {},
      {}
    );
    console.log(`Migrating ${allPlans.results.length} Records`);
    await Promise.all(allPlans.results.map(flattenPlan));
  }
  async init() {
    stores: {
      const businessOfficesPromise = await appContext.BusinessOffices.ToList().then(businessOfficeStore);
      const recordSourcesPromise = await appContext.RecordSources.ToList().then(
        sourcesStore
      );
      await Promise.all([businessOfficeStore, recordSourcesPromise]);
    }
  }
  static async Create() {
    const app = new _App();
    await app.init();
    return app;
  }
};
async function initApp() {
  await InitSal();
  const vm2 = await App.Create();
  ko.applyBindings(vm2);
}
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
//# sourceMappingURL=migrations.js.map
