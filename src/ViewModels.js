/* 
    ViewModels.js

    Define the viewmodels that we will be using from the CARCAP process.
    This will be included on every page, so let's load it up.

*/
/*****************************************************************************/
/*                          Bindings                                         */
/*****************************************************************************/

/*****************************************************************************/
/*                          Models                                           */
/*****************************************************************************/
// ViewModel = window.ViewModel || {}
const loc = window.location;
var directSiteUrl = loc.origin;
if (loc.host[0] == "s") {
  //in staging
  directSiteUrl += "/sites/cgfsweb/QMS/";
} else {
  directSiteUrl += "/sites/QMS-CI";
}

// ADMINTYPE is currently set by the page the user is accessing
// Other roles are on the individual record and are determined
// dynamically using the vm.selectedRecord.userHasRole function
var ROLES = {
  ADMINTYPE: {
    USER: "",
    QO: "qo",
    QTM: "qtm",
    QTMB: "qtm-b",
  },
  SUBMITTER: "submitter",
  COORDINATOR: "coordinator",
  IMPLEMENTOR: "implementor", // This person is able push the record forward
  ACTIONRESPONSIBLEPERSON: "actionresponsibleperson",
  QSO: "qso",
  QAO: "qao",
};

var EXTENSIONDAYS = 45;

var LOCATION = {
  ALL: "All",
  CHARLESTON: "Charleston",
  BANGKOK: "Bangkok",
  WASHINGTON: "Washington",
  PARIS: "Paris",
  SOFIA: "Sofia",
  MANILA: "Manila",
};

var DOCTYPES = {
  SUPPORT: "Support",
  EFFECTIVENESS: "Effectiveness",
};

var TABS = {
  ALLPLANS: 0,
  QTMBPLANS: 1,
  MYPLANS: 2,
  QOPLANS: 3,
  PLANDETAIL: 4,
  MYAWAITINGACTION: 5,
  LOOKUP: 7,
};

var ACTIONSTATE = {
  PENDINGAPPROVAL: "Pending Plan Approval",
  INPROGRESS: "In progress",
  COMPLETED: "Completed",
};

function convertModelToViewfield(model) {
  vf = "<ViewFields>";
  for (let i = 0; i < model.length; i++) {
    vf = vf + "<FieldRef Name='" + model[i] + "'/>";
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
  "Manila",
];

var RecordSourcesListDef = {
  name: "Record_Sources",
  title: "Record_Sources",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    RecordType: { type: "Text" },
    SelfInitiated: { type: "Bool" },
  },
};

var CIItemListDef = {
  name: "CAP_Main",
  title: "CAP_Main",
  viewModelObj: "selectedRecord",
  viewFields: {
    ID: { type: "Text" },
    Active: { type: "Bool" },
    Author: { type: "Person" },
    CloseDate: { type: "Date" },
    CancelReason: { type: "Text" },
    Created: { type: "Date" },
    Title: { type: "Text" },
    RecordType: { type: "Text" },
    BusinessOffice: { type: "Text" },
    CGFSLocation: { type: "Text" },
    QSO: { type: "Person" },
    QAO: { type: "Person" },
    OFIDescription: { type: "Text" },
    DiscoveryDataAnalysis: { type: "Text" },
    SubmittedDate: { type: "Date" },
    SubmittedBy: { type: "Text" },
    ProblemResolverName: { type: "Person" },
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
    NextTargetDate: { type: "Date" },
  },
};

var CAPModel = [
  "Active",
  "Title",
  "RecordType",
  "BusinessOffice",
  "CGFSLocation",
  "QSO",
  "QAO",
  "OFIDescription",
  "DiscoveryDataAnalysis",
  "SubmittedDate",
  "SubmittedBy",
  "ProblemResolverName",
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
    PreviousActionResponsiblePerson: { type: "Person" },
  },
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
  "PreviousActionResponsiblePerson",
];

var WhyListDef = {
  name: "Root_Cause_Why",
  title: "Root_Cause_Why",
  viewFields: {
    ID: { type: "Text" },
    Title: { type: "Text" },
    Number: { type: "Text" },
    Question: { type: "Text" },
    Answer: { type: "Text" },
  },
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
    RejectionId: { type: "Text" },
  },
};
var RejectionModel = [
  "Title",
  "Reason",
  "Stage",
  "Date",
  "Rejector",
  "Active",
  "RejectionId",
];

var OfficeModel = [
  "Charleston",
  "Washington",
  "Bangkok",
  "Manila",
  "Paris",
  "Sofia",
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
    QSO_Manila: { type: "Person" },
  },
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
  "QSO_Manila",
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
    Note: { type: "Text" },
  },
};

//var SupportDocumentModel = ['NewColumn1', 'LinkFileName', 'Title'];

//var EffectivenessDocumentModel = ['Title', 'LinkFileName', 'Record'];

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
    Author: { type: "Person" },
  },
};

var DocumentModel = ["Title", "LinkFileName", "Record", "DocType"];

var recordViewFields = convertModelToViewfield(CAPModel);

var actionViewFields = convertModelToViewfield(ActionModel);

var documentViewFields = convertModelToViewfield(DocumentModel);

var whyViewFields = convertModelToViewfield(WhyModel);

var rejectionViewFields = convertModelToViewfield(RejectionModel);

var businessOfficeViewFields = convertModelToViewfield(BusinessOfficeModel);

var stageDescriptions = {
  Editing: {
    stage: "Editing",
    description: "CAR has been rejected by Quality Owner, to be closed by QTM.",
    stageNum: 1,
    progress: "5%",
  },
  ProblemApprovalQTMB: {
    actionTaker: ROLES.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Problem Approval",
    description: "CAR originated in CGFS-B, problem must be approved by QTM-B.",
    stageNum: 1,
    progress: "5%",
    next: function () {
      return "ProblemApprovalQTM";
    },
    onReject: function () {
      return "Editing";
    },
  },
  ProblemApprovalQTM: {
    actionTaker: ROLES.ADMINTYPE.QTM,
    stage: "Pending QTM Problem Approval",
    description: "CAR problem must be approved by QTM.",
    stageNum: 1,
    progress: "10%",
    next: function () {
      return "ProblemApprovalQSO";
    },
    onReject: function () {
      return "Editing";
    },
  },
  ProblemApprovalQSO: {
    actionTaker: ROLES.QSO,
    stage: "Pending QSO Problem Approval",
    description: "CAR problem must be approved by QSO",
    stageNum: 1,
    progress: "15%",
    next: function () {
      return "DevelopingActionPlan";
    },
    onReject: function () {
      return "ProblemApprovalQAO";
    },
  },
  ProblemApprovalQAO: {
    actionTaker: ROLES.QAO,
    stage: "Pending QAO Problem Approval",
    description: "CAR rejected by QSO, problem must be approved by QAO",
    stageNum: 1,
    progress: "20%",
    next: function () {
      return "DevelopingActionPlan";
    },
    onReject: function () {
      return "Editing";
    },
  },
  DevelopingActionPlan: {
    actionTaker: ROLES.IMPLEMENTOR,
    stage: "Developing Action Plan",
    description:
      "Initiator or CAR/CAP Coordinator must create an action plan. Add at least one action to continue.",
    stageNum: 2,
    progress: "25%",
    next: function () {
      return "PlanApprovalQSO";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  PlanApprovalQSO: {
    actionTaker: ROLES.QSO,
    stage: "Pending QSO Plan Approval",
    description: "Quality Owner must approve the action plan.",
    stageNum: 2,
    progress: "33%",
    next: function () {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "PlanApprovalQTMB";
      }
      return "PlanApprovalQTM";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  PlanApprovalQSOAction: {
    actionTaker: ROLES.QSO,
    stage: "Pending QSO Plan Approval: Action",
    description:
      "An action has been edited, the quality owner must approve it.",
    stageNum: 2,
    progress: "33%",
    next: function () {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "PlanApprovalQTMB";
      }
      return "PlanApprovalQTM";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  PlanApprovalQTMB: {
    actionTaker: ROLES.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Plan Approval",
    description: "QTM-B must approve the action plan.",
    stageNum: 2,
    progress: "40%",
    next: function () {
      return "PlanApprovalQTM";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  PlanApprovalQTM: {
    actionTaker: ROLES.ADMINTYPE.QTM,
    stage: "Pending QTM Plan Approval",
    description: "QTM must approve the action plan.",
    stageNum: 2,
    progress: "40%",
    next: function () {
      return "ImplementingActionPlan";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  ImplementingActionPlan: {
    actionTaker: ROLES.IMPLEMENTOR,
    stage: "Implementing Action Plan",
    description:
      "Responsible party must complete action items.  When all actions are completed, CAR/CAP Coordinator proposes Target Verification Date to move to Stage 4.",
    stageNum: 3,
    progress: "50%",
    next: function () {
      return "ImplementationApproval";
    },
    onReject: function () {
      return "DevelopingActionPlan";
    },
  },
  ImplementationApproval: {
    actionTaker: ROLES.QSO,
    stage: "Pending QSO Implementation Approval",
    description:
      "Quality Owner must sign off on completion of action plan and effectiveness verification target date.",
    stageNum: 3,
    progress: "63%",
    next: function () {
      return "EffectivenessSubmission";
    },
    onReject: function () {
      return "ImplementingActionPlan";
    },
  },
  EffectivenessSubmission: {
    actionTaker: ROLES.IMPLEMENTOR,
    stage: "Pending Effectiveness Submission",
    description:
      "The user must provide proof of effectiveness and submit this record.",
    stageNum: 4,
    progress: "75%",
    next: function () {
      return "EffectivenessApprovalQSO";
    },
    onReject: function () {
      return "ImplementingActionPlan";
    },
  },
  EffectivenessSubmissionRejected: {
    actionTaker: ROLES.IMPLEMENTOR,
    stage: "Pending Effectiveness Submission: Rejected",
    description:
      "The user must provide additional proof of effectiveness and re-submit this record.",
    stageNum: 4,
    progress: "75%",
  },
  EffectivenessApprovalQSO: {
    actionTaker: ROLES.QSO,
    stage: "Pending QSO Effectiveness Approval",
    description: "The Quality Owner must approve the proof of effectiveness.",
    stageNum: 4,
    progress: "80%",
    next: function () {
      if (vm.selectedRecord.CGFSLocation() == LOCATIONS.BANGKOK) {
        return "EffectivenessApprovalQTMB";
      }
      return "EffectivenessApprovalQTM";
    },
    onReject: function () {
      var rejectReason = $("#selectEffectivenessRejectReason").val();

      switch (rejectReason) {
        case "Lack of Evidence":
          return "EffectivenessSubmissionRejected";
        case "Not Effective":
          return "DevelopingActionPlan";
      }
    },
  },
  EffectivenessApprovalQTMB: {
    actionTaker: ROLES.ADMINTYPE.QTMB,
    stage: "Pending QTM-B Effectiveness Approval",
    description:
      "This record originated in Bangkok, and effectiveness must be approved at QTM-B.",
    stageNum: 4,
    progress: "85%",
  },
  EffectivenessApprovalQTM: {
    actionTaker: ROLES.ADMINTYPE.QTM,
    stage: "Pending QTM Effectiveness Approval",
    description: "The QTM must approve the proof of effectiveness.",
    stageNum: 4,
    progress: "90%",
  },
  ClosedAccepted: {
    stage: "Closed: Accepted",
    description:
      "This action plan has been completed and the verification accepted.",
    stageNum: 5,
    progress: "100%",
  },
  ClosedRejected: {
    stage: "Closed: Rejected",
    description: "This action plan has been rejected by the QTM.",
    stageNum: 5,
    progress: "100%",
  },
  ClosedRecalled: {
    stage: "Closed: Closed by Submitter",
    description: "This action plan has been closed by the submitter.",
    stageNum: 5,
    progress: "100%",
  },
};

var appProcessesStates = {
  init: "Initializing the Application",
  save: "Saving Plan...",
  cancelAction: "Cancelling Action...",
  view: "Viewing Plan...",
  refresh: "Refreshing Plan...",
  lock: "Locking Plan...",
  closing: "Closing Plan...",
  opening: "Re-Opening Plan...",
  pipeline: "Progressing to Next Stage...",
  refreshPlans: "Refreshing Data...",
  newComment: "Refreshing Comments...",
  newAction: "Refreshing Actions...",
  approve: "Approving Plan...",
};

// Filter for CAPViewModel actions
function checkComplete(action) {
  return action.ImplementationStatus != "Completed";
}

function clearVM() {
  vm.ProblemResolverName("");
  vm.EffectivenessVerificationTargetDate();
  vm.SupportDocuments([]);
  vm.EffectivenessDocuments([]);
}

// CAP Model View
function CAPViewModel(capIdstring) {
  console.log("evaluating viewmodel");
  var self = this;

  // self.AdminTypes = ko.observableArray(["", "qo", "qtm", "qtm-b"]);

  // self.currentUser = ko.observable(
  //   $().SPServices.SPGetCurrentUser({
  //     fieldName: "Title",
  //     debug: false,
  //   })
  // );
  var APPPROCESSTIMEOUT = 10 * 1000; // 10 seconds
  var APPPROCESSDISMISSTIMEOUT = 1000;
  self.app = {
    processes: {
      addTask: function (task) {
        var newTask = {
          id: Math.floor(Math.random() * 100000 + 1),
          task: task,
          active: ko.observable(true),
        };

        newTask.timeout = window.setTimeout(function () {
          console.error("this task is aging:", newTask);
          alert(
            "Something seems to have gone wrong performing the following action: " +
              newTask.task
          );
        }, APPPROCESSTIMEOUT);
        vm.app.processes.tasks.push(newTask);
        return newTask.id;
      },
      finishTask: function (task) {
        let activeTask = vm.app.processes.tasks().find(function (taskItem) {
          return taskItem.task == task && taskItem.active();
        });
        if (activeTask) {
          window.clearTimeout(activeTask.timeout);
          activeTask.active(false);
          window.setTimeout(function () {
            vm.app.processes.removeTask(activeTask);
          }, APPPROCESSDISMISSTIMEOUT);
        }
      },
      removeTask: function (taskToRemove) {
        self.app.processes.tasks(
          self.app.processes.tasks().filter(function (task) {
            return task.id != taskToRemove.id;
          })
        );
      },
      tasks: ko.observableArray(),
      dimmerActivity: ko.pureComputed(function () {
        console.log("dimmer state changed");
        return self.app.processes.tasks().length;
      }),
    },
  };

  self.bindingCompleteHandlers = {
    tableBound: function (nodes) {
      // var start = new Date();
      // console.log("Bound", nodes);
      var tableId = "#" + nodes.id;
      makeDataTable(tableId);
      $(tableId + " .dropdown").dropdown();
      // console.log(tableId, new Date() - start);
    },
  };
  self.stageDescriptionsArray = ko.pureComputed(function () {
    return Object.keys(stageDescriptions).map(function (key) {
      return stageDescriptions[key];
    });
  });

  self.impersonateUserField = new PeopleField();

  self.impersonateUserField.ensuredPeople.subscribe(function (people) {
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
    businessOfficeOwnership: ko.pureComputed(function () {
      var userId = self.currentUserObj.id();
      var myOffices = [];
      self.allBusinessOffices().map(function (office) {
        if (office.QAO.get_lookupId() == userId) {
          var qaoObj = {};
          qaoObj.id = office.ID;
          qaoObj.location = "All";
          qaoObj.office = office.Title;
          qaoObj.department = office.Department;
          qaoObj.type = "qao";
          myOffices.push(qaoObj);
        }
        for (j = 0; j < locations.length; j++) {
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
      self.allTempQOs().map(function (office) {
        if (office.Person.get_lookupId() == userId) {
          var adminObj = {
            id: office.Office.get_lookupId(),
            office: office.Office.get_lookupValue(),
            location: office.Location,
            type: office.Role,
          };
          myOffices.push(adminObj);
        }
      });
      return myOffices;
    }),
  };

  self.tab = ko.observable();

  self.tab.subscribe(function (newTab) {
    $("#tabs").tabs("option", "active", newTab);
    Common.Utilities.updateUrlParam("tab", newTab.toString());
  });

  self.selectedTitleObs = ko.observable();
  self.selectedTitle = ko.pureComputed({
    write: function (newSelection) {
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
    read: function () {
      return self.selectedTitleObs();
    },
  });

  // self.selectedTitle.subscribe(function (newSelection) {
  //   if (!newSelection) return;
  //   if (self.currentlyEditingSection() > 0) {
  //     if (confirm("Do you want to discard changes?")) {
  //       self.discardEdits();
  //     } else {
  //       return;
  //     }
  //   }
  //   Common.Utilities.updateUrlParam("capid", newSelection);

  //   if (newSelection == self.selectedRecord.Title()) {
  //     return;
  //   }
  //   LoadSelectedCAP(newSelection);
  // });

  // Default adminType to that provided on page.
  self.AdminType = ko.observable(adminType || "");

  self.AdminType.subscribe(function (val) {
    console.log("admintype has changed: ", val);
  });

  // Declare our record object arrays for different views (My CARs/CAPs, Awaiting Action, etc)
  self.allBusinessOffices = ko.observableArray([]);
  self.allTempQOs = ko.observableArray([]);

  self.allRecordsArray = ko.observableArray([]);
  self.allActionsArray = ko.observableArray([]);

  self.allOpenRecordsArray = ko.pureComputed(function () {
    return self.allRecordsArray().filter(function (record) {
      return record.Active;
    });
  });

  self.allOpenActionsArray = ko.pureComputed(function () {
    return self.allActionsArray().filter(function (action) {
      return action.ImplementationStatus != "Completed";
    });
  });

  self.actionsMapping = ko.pureComputed(function () {
    var start = new Date();
    var plans = {};
    self.allRecordsArray().map(function (plan) {
      plans[plan.Title] = self.allActionsArray().filter(function (action) {
        return action.Title == plan.Title;
      });
    });
    var end = new Date();
    console.log("Actions Mapped in: ", (end - start) / 1000);
    return plans;
  });

  self.myOpenRecordsArray = ko.pureComputed(function () {
    var userId = self.currentUserObj.id();
    return self.allOpenRecordsArray().filter(function (record) {
      if (
        record.ProblemResolverName &&
        record.ProblemResolverName.get_lookupId() == userId
      ) {
        return true;
      }

      if (record.Author.get_lookupId() == userId) {
        return true;
      }

      return false;
    });
  });

  self.myOpenActionsArray = ko.pureComputed(function () {
    var userId = self.currentUserObj.id();
    return self.allOpenActionsArray().filter(function (action) {
      return action.ActionResponsiblePerson.get_lookupId() == userId;
    });
  });

  self.myAwaitingActionRecords = ko.pureComputed(function () {
    var myStages = [
      "Implementing Action Plan",
      "Developing Action Plan",
      "Pending Effectiveness Submission",
    ];
    return self.myOpenRecordsArray().filter(function (record) {
      return myStages.includes(record.ProcessStage);
    });
  });

  self.myAwaitingActionActions = ko.pureComputed(function () {
    return self.myOpenActionsArray().filter(function (action) {
      return action.ImplementationStatus == "In progress";
    });
  });

  self.qoOpenRecords = ko.pureComputed(function () {
    // There are three types of records
    // 1. Records that we have been assigned as QSO or QAO directly
    // 2. Records that are in our QAO BusinessOffices
    // 3. Records that are in our QSO BusinessOffice and Location
    var userId = self.currentUserObj.id();
    var officeIds = self.currentUserObj
      .businessOfficeOwnership()
      .map(function (office) {
        return office.id;
      });
    var assignedRecords = self.allOpenRecordsArray().filter(function (record) {
      //1. Records that have been assigned directly
      if (record.QSO && record.QSO.get_lookupId() == userId) {
        return true;
      }
      if (record.QAO && record.QAO.get_lookupId() == userId) {
        return true;
      }
      return false;
    });

    var officeRecords = [];
    self.currentUserObj.businessOfficeOwnership().map(function (office) {
      if (office.type == ROLES.QSO) {
        // 3. match both the BusinessOffice and Location
        officeRecords = officeRecords.concat(
          self.allOpenRecordsArray().filter(function (record) {
            return (
              record.BusinessOffice.get_lookupId() == office.id &&
              (office.location == "All" ||
                record.CGFSLocation == office.location)
            );
          })
        );
      }
      if (office.type == ROLES.QAO) {
        // 2. Match just the business office
        officeRecords = officeRecords.concat(
          self.allOpenRecordsArray().filter(function (record) {
            return record.BusinessOffice.get_lookupId() == office.id;
          })
        );
      }
    });

    assignedRecords = assignedRecords.concat(officeRecords);

    // now filter duplicates
    return assignedRecords.filter(function (record, index, self) {
      return (
        index ===
        self.findIndex(function (subrecord) {
          return subrecord.Title === record.Title;
        })
      );
    });
  });

  self.qoOpenActions = ko.pureComputed(function () {
    var qoActions = [];
    self.qoOpenRecords().forEach(function (record) {
      qoActions = qoActions.concat(self.actionsMapping()[record.Title]);
    });

    return qoActions.filter(function (action) {
      return action.ImplementationStatus != "Completed";
    });
  });

  self.qoAwaitingActionRecords = ko.pureComputed(function () {
    var qoStages = [
      "Pending QSO Problem Approval",
      "Pending QAO Problem Approval",
      "Pending QSO Plan Approval",
      "Pending QSO Plan Approval: Action",
      "Pending QSO Implementation Approval",
      "Pending QSO Effectiveness Approval",
    ];
    return self.qoOpenRecords().filter(function (record) {
      if (qoStages.includes(record.ProcessStage)) {
        return true;
      }
    });
  });

  self.filterRequiresQOAction = function (record) {
    var qoStages = [
      "Pending QSO Problem Approval",
      "Pending QAO Problem Approval",
      "Pending QSO Plan Approval",
      "Pending QSO Plan Approval: Action",
      "Pending QSO Implementation Approval",
      "Pending QSO Effectiveness Approval",
    ];
    if (qoStages.includes(record.ProcessStage)) {
      return true;
    }
  };

  self.filterAwaitingActionByCurRoleStages = ko.pureComputed(function () {
    var stages = [];
    switch (vm.AdminType()) {
      case ROLES.ADMINTYPE.USER:
        stages = [
          "Implementing Action Plan",
          "Developing Action Plan",
          "Pending Effectiveness Submission",
        ];
        break;
      case ROLES.ADMINTYPE.QO:
        stages = [
          "Pending QSO Problem Approval",
          "Pending QAO Problem Approval",
          "Pending QSO Plan Approval",
          "Pending QSO Plan Approval: Action",
          "Pending QSO Implementation Approval",
          "Pending QSO Effectiveness Approval",
        ];
        break;
      case ROLES.ADMINTYPE.QTM:
        stages = [
          "Pending QTM Problem Approval",
          "Pending QTM Plan Approval",
          "Pending QTM Effectiveness Approval",
        ];
        break;
      case ROLES.ADMINTYPE.QTMB:
        stages = [
          "Pending QTM-B Problem Approval",
          "Pending QTM-B Plan Approval",
          "Pending QTM-B Effectiveness Approval",
        ];
        break;
      default:
    }
    return stages;
  });

  self.qoAwaitingActionActions = ko.pureComputed(function () {
    var qoStages = ["Requires Approval QSO", "Requires Approval QAO"];

    return self.qoOpenActions().filter(function (action) {
      return qoStages.includes(action.ImplementationStatus);
    });
  });

  self.qtmbOpenRecordsArray = ko.pureComputed(function () {
    return self.allOpenRecordsArray().filter(function (record) {
      return record.CGFSLocation == "Bangkok";
    });
  });

  self.qtmbAwaitingActionRecords = ko.pureComputed(function () {
    var qtmbStages = [
      "Pending QTM-B Problem Approval",
      "Pending QTM-B Plan Approval",
      "Pending QTM-B Effectiveness Approval",
    ];
    return self.qtmbOpenRecordsArray().filter(function (record) {
      return qtmbStages.includes(record.ProcessStage);
    });
  });

  self.filterRequiresQTMBAction = function (record) {
    var qtmStages = [
      "Pending QTM-B Problem Approval",
      "Pending QTM-B Plan Approval",
      "Pending QTM-B Effectiveness Approval",
    ];
    return qtmStages.includes(record.ProcessStage);
  };

  self.qtmAwaitingActionRecords = ko.pureComputed(function (record) {
    var qtmStages = [
      "Pending QTM Problem Approval",
      "Pending QTM Plan Approval",
      "Pending QTM Effectiveness Approval",
    ];
    return self.allOpenRecordsArray().filter(function (record) {
      return qtmStages.includes(record.ProcessStage);
    });
  });

  self.filterRequiresQTMAction = function (record) {
    var qtmStages = [
      "Pending QTM Problem Approval",
      "Pending QTM Plan Approval",
      "Pending QTM Effectiveness Approval",
    ];
    return qtmStages.includes(record.ProcessStage);
  };

  self.coordinatorAwaitingActionRecords = ko.pureComputed(function (record) {
    var userId = self.currentUserObj.id();
    var coordinatorStages = [
      "Implementing Action Plan",
      "Developing Action Plan",
      "Pending Effectiveness Submission",
    ];
    return self.allOpenRecordsArray().filter(function (record) {
      return (
        record.ProblemResolverName.get_lookupId() == userId &&
        coordinatorStages.includes(record.ProcessStage)
      );
    });
  });

  // All the available record titles
  self.CAPIDOptions = ko.pureComputed(function () {
    var records = [];
    switch (vm.AdminType()) {
      case ROLES.ADMINTYPE.USER:
        records = self.myOpenRecordsArray();
        break;
      case ROLES.ADMINTYPE.QO:
        records = self.qoOpenRecords();
        break;
      case ROLES.ADMINTYPE.QTM:
        records = self.allOpenRecordsArray();
        break;
      case ROLES.ADMINTYPE.QTMB:
        records = self.qtmbOpenRecordsArray();
        break;
    }
    return records
      .map(function (record) {
        return record.Title;
      })
      .sort()
      .reverse();
  });

  //self.MyOpenRecordsArray = ko.observableArray();
  self.MyAwaitingActionRecordsArray = ko.pureComputed(function () {
    // Based on the current role, return the appropriate action set
    switch (vm.AdminType()) {
      case ROLES.ADMINTYPE.QO:
        return self.qoOpenRecords();
      case ROLES.ADMINTYPE.QTM:
        return self.allOpenRecordsArray();
    }
  });
  self.LookupRecordsArray = ko.observableArray();

  //self.CAPArray = ko.observableArray();
  //self.ApprovalArray = ko.observableArray();
  self.ApprovalArray = ko.observableArray();

  self.ActionListItems = ko.pureComputed(function () {
    return self.actionsMapping()[self.selectedRecord.Title()] || [];
  });

  // Be sure to deprecate
  self.ActionsRequiringAction = ko.observableArray();
  self.LookupArray = ko.observableArray();
  // Deprecate

  self.selectedDocuments = ko.observableArray();
  self.SupportDocuments = ko.pureComputed(function () {
    return self.selectedDocuments().filter(function (doc) {
      return doc.DocType == "Support";
    });
  });
  self.EffectivenessDocuments = ko.pureComputed(function () {
    return self.selectedDocuments().filter(function (doc) {
      return doc.DocType == "Effectiveness";
    });
  });

  self.RecordType = ko.observable();
  self.RecordStatus = ko.observable();

  // This function handles arrays and objects
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
  self.discardEdits = function () {
    eachRecursive(self.section, setIsEditingFalse);
  };

  self.currentlyEditingSection = function () {
    var cnt = 0;
    eachRecursive(self.section, function (key, value) {
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
        isEditable: ko.pureComputed(function () {
          if (!self.selectedRecord.Active()) {
            return false;
          }
          if (self.selectedRecord.curUserHasRole(ROLES.QSO)) {
            return true;
          }
          return false;
        }),
        tempCoordinator: new PeopleField(),
        edit: function () {
          if (self.selectedRecord.ProblemResolverName.ensuredPeople().length) {
            self.section.Info.coordinator.tempCoordinator.addPeople(
              self.selectedRecord.ProblemResolverName.ensuredPeople()[0]
            );
          }
          self.section.Info.coordinator.isEditing(true);
        },
        save: function () {
          self.selectedRecord.ProblemResolverName.removeAllPeople();
          var valuePair = [
            [
              "ProblemResolverName",
              self.section.Info.coordinator.tempCoordinator.getValueForWrite(),
            ],
          ];
          self.section.Info.coordinator.isEditing(false);
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            valuePair,
            m_fnRefresh
          );
        },
        cancel: function () {
          self.section.Info.coordinator.isEditing(false);
        },
      },
    },
    OpportunityForImprovement: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (self.section.OpportunityForImprovement.isEditing()) {
          return false;
        }
        // Implementors can only update their own problems.
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        if (
          ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0
        ) {
          return true;
        }

        return false;
      }),
      value: ko.observable(),
      edit: function () {
        self.section.OpportunityForImprovement.value(
          self.selectedRecord.OFIDescription()
        );
        self.section.OpportunityForImprovement.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["OFIDescription", self.section.OpportunityForImprovement.value()],
        ];
        self.section.OpportunityForImprovement.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function () {
        self.section.OpportunityForImprovement.isEditing(false);
      },
    },
    DiscoveryDataAnalysis: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (self.section.DiscoveryDataAnalysis.isEditing()) {
          return false;
        }
        // Implementors can only update their own problems.
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        if (
          ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0
        ) {
          return true;
        }

        return false;
      }),
      value: ko.observable(),
      edit: function () {
        self.section.DiscoveryDataAnalysis.value(
          self.selectedRecord.DiscoveryDataAnalysis()
        );
        self.section.DiscoveryDataAnalysis.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["DiscoveryDataAnalysis", self.section.DiscoveryDataAnalysis.value()],
        ];
        self.section.DiscoveryDataAnalysis.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function () {
        self.section.DiscoveryDataAnalysis.isEditing(false);
      },
    },
    ProblemDescription: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (self.section.ProblemDescription.isEditing()) {
          return false;
        }
        if (self.selectedRecord.SelfInitiated() == "Yes") {
          // Implementors can only update their own problems.
          if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
            return false;
          }
          if (
            ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
              self.selectedRecord.ProcessStageKey()
            ) >= 0
          ) {
            return true;
          }
        } else if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return self.selectedRecord.ProcessStageKey() == "ProblemApprovalQTMB";
        } else {
          return self.selectedRecord.ProcessStageKey() == "ProblemApprovalQTM";
        }

        return false;
      }),
      value: ko.observable(),
      edit: function () {
        self.section.ProblemDescription.value(
          self.selectedRecord.ProblemDescription()
        );
        self.section.ProblemDescription.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["ProblemDescription", self.section.ProblemDescription.value()],
        ];
        self.section.ProblemDescription.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function () {
        self.section.ProblemDescription.isEditing(false);
      },
    },
    ContainmentAction: {
      isVisible: ko.pureComputed(function () {
        return (
          self.selectedRecord.SelfInitiated() == "Yes" ||
          self.selectedRecord.ProcessStageObj().stageNum >= 2
        );
      }),
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (self.section.ContainmentAction.isEditing()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        if (
          ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0
        ) {
          return true;
        }
        return false;
      }),
      value: ko.observable(),
      actionDate: new DateField({ type: "date" }),
      edit: function () {
        self.section.ContainmentAction.value(
          self.selectedRecord.ContainmentAction()
        );
        // If our datetime is set
        if (
          self.selectedRecord.ContainmentActionDate.isDate() &&
          self.selectedRecord.ContainmentActionDate.date().getTime()
        ) {
          self.section.ContainmentAction.actionDate.date(
            self.selectedRecord.ContainmentActionDate.date()
          );
        }
        self.section.ContainmentAction.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["ContainmentAction", self.section.ContainmentAction.value()],
          [
            "ContainmentActionDate",
            self.section.ContainmentAction.actionDate.isDate()
              ? self.section.ContainmentAction.actionDate.date().toISOString()
              : new Date(0).toISOString(),
          ],
        ];
        self.section.ContainmentAction.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
      cancel: function () {
        self.section.ContainmentAction.isEditing(false);
      },
    },
    RootCause: {
      new: function () {
        var args = {
          capID: self.selectedRecord.Title(),
          num: self.RootCauseWhy().length ? self.RootCauseWhy().length + 1 : 1,
        };
        app.listRefs.Whys.showModal(
          "NewForm.aspx",
          "New Why",
          args,
          OnCallbackFormRefresh
        );
      },
      editWhy: function (why) {
        var args = {
          id: why.ID,
        };
        app.listRefs.Whys.showModal(
          "EditForm.aspx",
          "Edit Question",
          args,
          OnCallbackFormRefresh
        );
      },
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        if (
          ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0
        ) {
          return true;
        }
        return false;
      }),
      determination: ko.observable(),
      edit: function () {
        self.section.RootCause.isEditing(true);
        self.section.RootCause.determination(
          self.selectedRecord.RootCauseDetermination()
        );
      },
      cancel: function () {
        self.section.RootCause.isEditing(false);
      },
      save: function () {
        var valuepair = [
          ["RootCauseDetermination", self.section.RootCause.determination()],
        ];
        self.section.RootCause.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
    },
    SimilarNonconformity: {
      isEditing: ko.observable(false),
      isEditable: ko.pureComputed(function () {
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        if (
          ["DevelopingActionPlan", "PlanApprovalQSO"].indexOf(
            self.selectedRecord.ProcessStageKey()
          ) >= 0
        ) {
          return true;
        }
        return false;
      }),
      edit: function () {
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
      cancel: function () {
        self.section.SimilarNonconformity.isEditing(false);
      },
      save: function () {
        var valuepair = [
          [
            "SimilarNoncomformityDesc",
            self.section.SimilarNonconformity.explanation(),
          ],
          [
            "SimilarNoncomformityBool",
            self.section.SimilarNonconformity.otherOfficeBool(),
          ],
        ];
        self.section.SimilarNonconformity.isEditing(false);
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuepair,
          m_fnRefresh
        );
      },
    },
    SupportDocs: {
      allowUploadSupportDoc: ko.pureComputed(function () {
        if (!self.selectedRecord.Active()) {
          return false;
        }
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        return [
          "Pending QTM-B Problem Approval",
          "Pending QTM Problem Approval",
          "Developing Action Plan",
          "Implementing Action Plan",
        ].includes(self.selectedRecord.ProcessStage());
      }),
      new: function () {
        var args = {
          capID: self.selectedRecord.Title(),
          docType: DOCTYPES.SUPPORT,
        };
        app.listRefs.SupportDocs.createFolderRec(
          vm.selectedRecord.Title(),
          function () {
            app.listRefs.SupportDocs.uploadNewDocument(
              vm.selectedRecord.Title(),
              "New Support Document",
              args,
              m_fnRefresh
            );
          }
        );
      },
      view: function (doc) {
        app.listRefs.SupportDocs.showModal(
          "DispForm.aspx",
          doc.FileLeafRef,
          {
            id: doc.ID,
          },
          function () {}
        );
      },
    },
    Actions: {
      allowSubmitNewAction: ko.pureComputed(function () {
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        return self.selectedRecord.ProcessStageKey() == "DevelopingActionPlan";
      }),
      completeEnable: function (action) {
        // Let's first check to see if our record is in one of the stages we can complete actions in
        if (
          ![
            "Implementing Action Plan",
            "Pending QSO Plan Approval: Action",
          ].includes(vm.selectedRecord.ProcessStage())
        ) {
          return false;
        }

        if (!vm.selectedRecord.curUserHasRole(ROLES.ACTIONRESPONSIBLEPERSON)) {
          return false;
        }

        if (action.ImplementationStatus == "In progress") {
          return true;
        }
        return false;
      },
      completeClass: function (action) {
        return action.ImplementationStatus == "Completed"
          ? "btn-success"
          : "btn-outline-success";
      },
      completeText: function (action) {
        return action.ImplementationStatus == "Completed"
          ? "Completed"
          : "Mark Complete";
      },
      completeClick: function (action) {
        var completionDate = new Date().toISOString();
        // Set the status of this action item to completed
        var vp = [
          ["ImplementationDate", completionDate],
          ["ImplementationStatus", "Completed"],
        ];
        app.listRefs.Actions.updateListItem(action.ID, vp, m_fnRefresh);
      },
      new: function () {
        // Get the next action item number
        var actionNoMax = 1;
        self.ActionListItems().forEach((action) => {
          let actionNo = parseInt(action.ActionID.split("-")[2].split("A")[1]);
          if (actionNo >= actionNoMax) {
            actionNoMax = actionNo + 1;
          }
        });
        var args = {
          capID: self.selectedRecord.Title(),
          count: actionNoMax,
        };
        app.listRefs.Actions.showModal(
          "NewForm.aspx",
          "New Action",
          args,
          OnActionCreateCallback
        );
      },
      isEditable: function (action) {
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }
        // Only edit in progress actions
        if (action.ImplementationStatus == ACTIONSTATE.COMPLETED) {
          return false;
        }
        return [
          "DevelopingActionPlan",
          "PlanApprovalQSO",
          "PlanApprovalQSOAction",
          "ImplementingActionPlan",
        ].includes(self.selectedRecord.ProcessStageKey());
      },
      editClick: function (action) {
        app.listRefs.Actions.showModal(
          "EditForm.aspx",
          action.Title,
          {
            id: action.ID,
            stage: self.selectedRecord.ProcessStage(),
          },
          OnActionEditCallback
        );
      },
      requiresApproval: function (action) {
        if (vm.AdminType()) {
          switch (action.ImplementationStatus) {
            case "Requires Approval QTM":
              return vm.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM);
            case "Requires Approval QAO":
              return vm.selectedRecord.curUserHasRole(ROLES.QAO);
            case "Requires Approval QSO":
              return vm.selectedRecord.curUserHasRole(ROLES.QSO);
            default:
              return false;
          }
        }

        return false;
      },
      approvalApproveClick: function (action) {
        valuePair = [
          ["ImplementationStatus", "In progress"],
          ["PreviousActionDescription", ""],
          ["PreviousActionResponsiblePerson", ""],
          ["PreviousTargetDate", null],
        ];

        app.listRefs.Actions.updateListItem(action.ID, valuePair, function () {
          //setActionApprovalState();
          //action.ImplementationStatus = 'In progress';
          app.listRefs.Actions.getListItems("", vm.allActionsArray);

          UpdateImplementationDate();
          m_fnRefresh();
        });
      },
      approvalRejectClick: function (action) {
        valuePair = [
          ["ImplementationStatus", "In progress"],
          ["PreviousActionDescription", ""],
          ["PreviousActionResponsiblePerson", ""],
          ["PreviousTargetDate", null],
          ["RevisionCount", action.RevisionCount - 1],
        ];

        if (action.PreviousActionDescription) {
          valuePair.push([
            "ActionDescription",
            action.PreviousActionDescription,
          ]);
        }

        if (action.PreviousActionResponsiblePerson) {
          valuePair.push([
            "ActionResponsiblePerson",
            action.PreviousActionResponsiblePerson.userId,
          ]);
        }

        if (action.PreviousTargetDate) {
          valuePair.push([
            "TargetDate",
            new Date(action.PreviousTargetDate).toISOString(),
          ]);
        }

        app.listRefs.Actions.updateListItem(action.ID, valuePair, function () {
          //setActionApprovalState();
          //action.ImplementationStatus = 'In progress';
          app.listRefs.Actions.getListItems("", vm.allActionsArray);

          UpdateImplementationDate();
          m_fnRefresh();
        });
      },
      changesClick: function (action) {
        app.listRefs.Actions.showModal(
          "ChangeForm.aspx",
          action.Title,
          {
            id: action.ID,
          },
          function () {}
        );
      },
      historyClick: function (action) {
        app.listRefs.Actions.showVersions(
          action.ID,
          action.Title,
          function () {}
        );
      },
      findLastActionTargetDate: function () {
        let actionItems = vm.allActionsArray().filter(function (action) {
          return action.Title == vm.selectedRecord.Title();
        });

        let maxDate = new Date(0);

        actionItems.forEach(function (action) {
          // Check if this action should be included in our new target date, or is awaiting approval.
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
      extendTargetDate: function (actionArr, days) {
        actionArr.forEach(function (action) {
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
            function () {}
          );
        });
      },
    },
    EffectivenessDocs: {
      ShowEffectivenessDocs: ko.pureComputed(function () {
        return (
          [
            "Pending Effectiveness Submission",
            "Pending Effectiveness Submission: Rejected",
            "Pending QSO Effectiveness Approval",
            "Pending QTM-B Effectiveness Approval",
            "Pending QTM Effectiveness Approval",
            "Accepted",
            "Closed: Accepted",
            "Closed: Rejected",
            "Closed: Closed by Submitter",
          ].indexOf(self.selectedRecord.ProcessStage()) > -1
        );
      }),
      isEditable: function () {
        return [
          "EffectivenessSubmission",
          "EffectivenessSubmissionRejected",
        ].includes(self.selectedRecord.ProcessStageKey());
      },
      officeRisk: {
        isEditing: ko.observable(false),
        editClick: function () {
          self.section.EffectivenessDocs.officeRisk.isEditing(true);
          self.section.EffectivenessDocs.officeRisk.description(
            self.selectedRecord.OfficeImpactDesc()
          );
          self.section.EffectivenessDocs.officeRisk.bool(
            self.selectedRecord.OfficeImpactBool()
          );
        },
        saveClick: function () {
          self.section.EffectivenessDocs.officeRisk.isEditing(false);
          var vp = [
            [
              "OfficeImpactDesc",
              self.section.EffectivenessDocs.officeRisk.description(),
            ],
            [
              "OfficeImpactBool",
              self.section.EffectivenessDocs.officeRisk.bool(),
            ],
          ];
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            vp,
            m_fnRefresh
          );
        },
        cancelClick: function () {
          self.section.EffectivenessDocs.officeRisk.isEditing(false);
        },
        description: ko.observable(),
        bool: ko.observable(),
      },
      proof: {
        isEditing: ko.observable(false),
        editClick: function () {
          self.section.EffectivenessDocs.proof.isEditing(true);
          self.section.EffectivenessDocs.proof.description(
            self.selectedRecord.EffectivenessDescription()
          );
        },
        cancelClick: function () {
          self.section.EffectivenessDocs.proof.isEditing(false);
        },
        saveClick: function () {
          self.section.EffectivenessDocs.proof.isEditing(false);
          var vp = [
            [
              "EffectivenessDescription",
              self.section.EffectivenessDocs.proof.description(),
            ],
          ];
          app.listRefs.Plans.updateListItem(
            self.selectedRecord.ID(),
            vp,
            m_fnRefresh
          );
        },
        description: ko.observable(),
        documents: {
          allowUploadEffectivenessDoc: ko.pureComputed(function () {
            return (
              self.selectedRecord.ProcessStageKey() ==
                "ImplementingActionPlan" &&
              vm.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)
            );
          }),
          new: function () {
            var args = {
              capID: self.selectedRecord.Title(),
              docType: DOCTYPES.EFFECTIVENESS,
            };
            app.listRefs.SupportDocs.createFolderRec(
              vm.selectedRecord.Title(),
              function () {
                app.listRefs.SupportDocs.uploadNewDocument(
                  vm.selectedRecord.Title(),
                  "New Effectiveness Document",
                  args,
                  OnCallbackFormRefresh
                );
              }
            );
          },
          view: function (doc) {
            app.listRefs.SupportDocs.showModal(
              "DispForm.aspx",
              doc.FileLeafRef,
              {
                id: doc.ID,
              },
              function () {}
            );
          },
        },
      },
    },
  };

  // This is just initializing an object with corresponding observables
  // based off the list def
  self.selectedRecord =
    Common.Utilities.observableObjectFromListDef(CIItemListDef);

  // Determine what stage we are based off the human readable ProcessStage
  self.selectedRecord.ProcessStageKey = ko.pureComputed(function () {
    if (!self.selectedRecord.ProcessStage()) {
      return "";
    }
    var stageKey = Object.keys(stageDescriptions).find(function (key) {
      return stageDescriptions[key].stage == self.selectedRecord.ProcessStage();
    });
    return stageKey;
  });

  self.selectedRecord.ProcessStageObj = ko.pureComputed(function () {
    var key = self.selectedRecord.ProcessStageKey();
    if (!key) return null;
    return stageDescriptions[key];
  });

  self.selectedRecord.curUserHasRole = function (role) {
    // determine if the current user has the requested role
    var userId = self.currentUserObj.id();
    switch (vm.AdminType()) {
      case ROLES.ADMINTYPE.QTM:
        // QTM should have all roles
        return true;
      case ROLES.ADMINTYPE.QTMB:
        if (role != ROLES.ADMINTYPE.QTM) {
          // QTM B has all roles for bangkok
          return self.selectedRecord.CGFSLocation() == "Bangkok";
        }
      case ROLES.ADMINTYPE.USER:
        /*check if this person is fits any of the following:
        problem resolver
        submitter
        action responsible person
        */
        switch (role) {
          case ROLES.IMPLEMENTOR:
            // this person is either the submitter (if self initiated)
            // or Coordinator.
            // Can the current user push the request forward
            if (self.selectedRecord.curUserHasRole(ROLES.COORDINATOR)) {
              return true;
            }
            if (
              self.selectedRecord.curUserHasRole(ROLES.SUBMITTER) &&
              self.selectedRecord.SelfInitiated() == "Yes"
            ) {
              return true;
            }
            return false;
          case ROLES.SUBMITTER:
            return self.selectedRecord.Author.containsPeopleById(userId)
              ? true
              : false;
          case ROLES.COORDINATOR:
            return self.selectedRecord.ProblemResolverName.containsPeopleById(
              userId
            )
              ? true
              : false;
          case ROLES.ACTIONRESPONSIBLEPERSON:
            // Check if we're either the implementor, or assigned on an action.
            if (self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
              return true;
            }
            return (
              self.ActionListItems().filter(function (actionItem) {
                return (
                  userId === actionItem.ActionResponsiblePerson.get_lookupId()
                );
              }).length > 0
            );
          default:
            return false;
        }
        break;
      case ROLES.ADMINTYPE.QO:
        // First, check if we've been assigned directly to this record
        // Note: let's go ahead and return true for QSO if the user is QAO
        if (![ROLES.QSO, ROLES.QAO, ROLES.IMPLEMENTOR].includes(role)) {
          return false;
        }

        if (vm.selectedRecord.QAO.containsPeopleById(userId)) {
          return true;
        }
        if (
          role === ROLES.QSO &&
          vm.selectedRecord.QSO.containsPeopleById(userId)
        ) {
          return true;
        }
        // Next, run through our business office ownership to see if we
        // are that office & locations QSO/QAO
        var isRoleFlag = false;
        self.currentUserObj.businessOfficeOwnership().some(function (office) {
          if (
            office.id === self.selectedRecord.BusinessOffice().get_lookupId()
          ) {
            if (office.type === role || office.type === ROLES.QAO) {
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

  // self.CAPApprovalStatus = ko.observable();

  // self.DiscoveryDataAnalysis = ko.observable();
  // self.OFIDescription = ko.observable();

  // self.QSOApprovalStatus = ko.observable();
  // self.QMSBApprovalStatus = ko.observable();
  // self.QTMApprovalStatus = ko.observable();

  // self.OfficeImpactBool = ko.observable("0");
  // self.OfficeImpactDesc = ko.observable("");

  // self.EffectivenessDescription = ko.observable();

  self.GetNumActionsApproval = ko.computed(function () {
    return self.ActionListItems().filter(function (action) {
      return action.ImplementationStatus == "Requires Approval";
    }).length;
  });

  self.contactQTM = ko.computed(function () {
    const qtmEmail = "CGFSQMSCARCAP@state.gov";

    const link =
      "mailto:" +
      qtmEmail +
      "?subject=CAR/CAP Record Remark" +
      "&body=Greetings,%0d%0a%0d%0aI have a remark regarding the following CAR/CAP: " +
      self.selectedTitle() +
      "%0d%0a%0d%0a" +
      "My remark is as follows:%0d%0a";

    return link;
  });

  self.printUrl = ko.computed(function () {
    if (!self.selectedTitle()) {
      return "javascript: void(0)";
    }
    return (
      _spPageContextInfo.siteServerRelativeUrl +
      "/SitePages/ReportView.aspx?capid=" +
      self.selectedTitle()
    );
  });

  // Return the percentage complete for the record for our progress bar.
  self.ProcessPercentage = ko.computed(function () {
    return (
      self.selectedRecord.ProcessStageObj() &&
      self.selectedRecord.ProcessStageObj().progress
    );
  });

  self.downloadDocument = function (doc) {
    return null;
  };

  self.NumActions = ko.computed(function () {
    return self.ActionListItems().length ? self.ActionListItems().length : 0;
  });
  self.NumOpenActions = ko.computed(function () {
    return self.NumActions() > 0
      ? self.ActionListItems().filter(checkComplete).length
      : 0;
  });
  self.NumClosedActions = ko.computed(function () {
    return self.NumActions() - self.NumOpenActions();
  });

  self.ActionPercentage = ko.computed(function () {
    const perc = 1 - self.NumOpenActions() / self.ActionListItems().length || 0;
    return perc * 100 + "%";
  });

  self.ActionProgressBarClass = ko.computed(function () {
    return self.ActionPercentage() == "100%" ? "bg-success" : "bg-info";
  });

  //console.log("Open length: " + self.NumOpenActions() + " Total Length: " + self.NumActions());

  /************************************************************/
  /*                  CAR Specific Stuff                      */
  /************************************************************/

  self.RootCauseWhy = ko.observableArray([]);

  self.IsCAR = ko.computed(function () {
    return self.selectedRecord.RecordType() == "CAR";
  });

  //self.EnableSubmitProblem = ko.computed(function () {
  //    return ((self.RecordType() == 'CAP'))
  //})

  // These are our pipeline object specific controls
  self.controls = {
    pipeline: {
      showStage1: ko.pureComputed(function () {
        var record = self.selectedRecord;
        return (
          record.ProcessStageObj().stageNum === 1 &&
          record.curUserHasRole(record.ProcessStageObj().actionTaker)
        );
      }),
      showStage2: ko.pureComputed(function () {
        var record = self.selectedRecord;
        return (
          record.ProcessStageObj().stageNum === 2 &&
          record.curUserHasRole(record.ProcessStageObj().actionTaker)
        );
      }),
      showStage3: ko.pureComputed(function () {
        var record = self.selectedRecord;
        return (
          record.ProcessStageObj().stageNum === 3 &&
          record.curUserHasRole(record.ProcessStageObj().actionTaker)
        );
      }),
      showStage4: ko.pureComputed(function () {
        var record = self.selectedRecord;
        return (
          record.ProcessStageObj().stageNum === 4 &&
          record.curUserHasRole(record.ProcessStageObj().actionTaker)
        );
      }),
    },
  };
  sortByCreatedDesc = function (item1, item2) {
    return item1.Created < item2.Created ? 1 : -1;
  };
  sortByTitle = function (item1, item2) {
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

  getNextItemCntByType = function (type) {
    // Pass CAP or CAR to filter and find the next incrementer

    const records = vm.allRecordsArray().filter(function (record) {
      return (
        record.RecordType == type &&
        record.Created.getFullYear() == new Date().getFullYear() &&
        record.Title
      );
    });
    // .forEach(function (record) {
    //   let recordNo = parseInt(record.Title.split("-")[1]);
    //   if (recordNo >= recordNoMax) {
    //     recordNoMax = recordNo + 1;
    //   }
    // });

    return records.length;
  };

  function GetNewID(type, count) {
    var id =
      type + new Date().format("yy") + "-" + count.toString().padStart(3, "0");
    return id;
  }

  getNextTitleByType = function (type) {
    const itemCount = getNextItemCntByType(type);
    switch (type) {
      case "CAR":
        return GetNewID("C", itemCount);
      case "CAP":
        return GetNewID("P", itemCount);
      default:
    }
  };

  // These are our record status/management controls
  self.controls.record = {
    new: function () {
      var cntCap = getNextItemCntByType("CAP");
      var cntCar = getNextItemCntByType("CAR");
      var args = {
        cnt: { cap: cntCap, car: cntCar },
      };
      app.listRefs.Plans.showModal(
        "NewForm.aspx",
        "Create a New CAP or CAR",
        args,
        (result, value) => {
          if (result === SP.UI.DialogResult.OK) {
            vm.app.processes.addTask(appProcessesStates.refreshPlans);
            const userId = vm.currentUserObj.id();
            app.listRefs.Plans.getListItems("", function (items) {
              vm.allRecordsArray(items);

              // Update Title
              const newPlan = items.findLast(
                (item) => item.Author.get_lookupId() == userId
              );
              const newTitle = getNextTitleByType(newPlan.RecordType);
              if (newTitle != newPlan.Title) {
                newPlan.Title = newTitle;
                app.listRefs.Plans.updateListItem(
                  newPlan.ID,
                  [["Title", newTitle]],
                  () => {}
                );
              }
              vm.selectedTitle(newPlan.Title);
              vm.tab(TABS.PLANDETAIL);
              vm.app.processes.finishTask(appProcessesStates.refreshPlans);
              // m_fnForward();
            });
          }
        }
      );
    },
    isEditable: ko.pureComputed(function () {
      if (!vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM)) {
        return true;
      }
      if (
        self.selectedRecord.SelfInitiated() == "No" &&
        self.selectedRecord.curUserHasRole(ROLES.SUBMITTER)
      ) {
        if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return ["Editing", "Pending QTM-B Problem Approval"].includes(
            self.selectedRecord.ProcessStage()
          );
        }
        return [
          "Editing",
          "Pending QTM-B Problem Approval",
          "Pending QTM Problem Approval",
        ].includes(self.selectedRecord.ProcessStage());
      }
      // if (self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
      //   return [
      //     "Editing",
      //     "Developing Action Plan",
      //     "Pending QSO Plan Approval",
      //   ].includes(self.selectedRecord.ProcessStage());
      // }
      return false;
    }),
    edit: function () {
      var args = {
        id: self.selectedRecord.ID(),
      };
      var form;
      if (self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM)) {
        form = "EditFormQTM.aspx";
        args.role = ROLES.ADMINTYPE.QTM;
      } else if (self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
        args.role = ROLES.ADMINTYPE.IMPLEMENTOR;
        form = "EditFormUser.aspx";
      } else {
        form = "EditFormUser.aspx";
        args.role = ROLES.ADMINTYPE.SUBMITTER;
      }
      app.listRefs.Plans.showModal(
        form,
        self.selectedTitle(),
        args,
        OnCallbackFormRefresh
      );
    },
    isCloseable: ko.pureComputed(function () {
      if (!vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM)) {
        return true;
      }
      if (
        self.selectedRecord.SelfInitiated() == "No" &&
        self.selectedRecord.curUserHasRole(ROLES.SUBMITTER)
      ) {
        if (self.selectedRecord.CGFSLocation() == LOCATION.BANGKOK) {
          return ["Editing", "Pending QTM-B Problem Approval"].includes(
            self.selectedRecord.ProcessStage()
          );
        }
        return ["Editing", "Pending QTM Problem Approval"].includes(
          self.selectedRecord.ProcessStage()
        );
      }
      if (self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
        return [
          "Editing",
          "Developing Action Plan",
          "Pending QSO Plan Approval",
        ].includes(self.selectedRecord.ProcessStage());
      }
      return false;
    }),
    close: function () {
      $("#close-modal").modal("hide");
      var valuePair = [];
      if (vm.AdminType() == ROLES.ADMINTYPE.USER) {
        closePlan(self.selectedRecord.ID(), {
          title: self.selectedRecord.Title(),
          newStage: "Closed: Closed by Submitter",
          prevStage: vm.selectedRecord.ProcessStage(),
          cancelReason: vm.selectedRecord.CancelReason(),
        });
      } else {
        closePlan(self.selectedRecord.ID(), {
          title: self.selectedRecord.Title(),
          newStage: "Closed: Rejected",
          prevStage: vm.selectedRecord.ProcessStage(),
          cancelReason: vm.selectedRecord.CancelReason(),
        });
      }
    },
    displayCloseDialog: function () {
      $("#close-modal").modal("show");
    },
    isOpenable: ko.pureComputed(function () {
      if (vm.selectedRecord.Active()) {
        return false;
      }
      if (self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM)) {
        return true;
      }
      return false;
    }),
    open: function () {
      if (confirm("Are you sure you want to Re-Open this record?")) {
        vm.app.processes.addTask(appProcessesStates.opening);
        valuePair = [
          ["ProcessStage", vm.selectedRecord.PreviousStage()],
          ["Active", "1"],
          ["CloseDate", null],
          ["CancelReason", null],
        ];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          function () {
            vm.app.processes.finishTask(appProcessesStates.opening);
            //   toggleLockPlan(self.selectedRecord.Title(), false, function () {
            //     alert("Plan has been unlocked.");
            //     m_fnRefresh();
            //   });
            m_fnRefresh();
          }
        );
      }
    },
    extension: {
      showExtensionRequestSection: function () {
        if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
          return false;
        }

        if (self.selectedRecord.ProcessStageKey() != "ImplementingActionPlan") {
          return false;
        }
        return true;
      },
      requestExtension: function () {
        var valuePair = [["ExtensionRequested", true]];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          m_fnRefresh
        );
      },
      cancelRequest: function () {
        var valuePair = [["ExtensionRequested", false]];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          m_fnRefresh
        );
      },
      extensionApprover: ko.pureComputed(function () {
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
      showApproval: ko.pureComputed(function () {
        if (!self.selectedRecord.ExtensionRequested()) {
          return false;
        }
        if (!self.selectedRecord.Active()) {
          return false;
        }
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        extCnt = isNaN(extCnt) ? 0 : extCnt;
        if (extCnt == 0) {
          return self.selectedRecord.curUserHasRole(ROLES.QSO);
        }
        if (extCnt == 1) {
          return self.selectedRecord.curUserHasRole(ROLES.QAO);
        }
        if (extCnt >= 2) {
          return self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM);
        }
        return false;
      }),
      approveRequest: function () {
        var extCnt = parseInt(self.selectedRecord.ExtensionCount());
        if (isNaN(extCnt)) {
          extCnt = 0;
        }
        self.selectedRecord.ExtensionCount(++extCnt);
        // Get our next target date based off our current implementation date
        var newNextDate = self.controls.record.extension.totalExtensionDate(
          vm.section.Actions.findLastActionTargetDate()
        );
        var valuePair = [
          ["ExtensionRequested", false],
          ["ExtensionCount", extCnt],
          ["NextTargetDate", newNextDate.toISOString()],
          ["ImplementationTargetDate", newNextDate.toISOString()],
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
      totalExtensionDate: function (startDate) {
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
      },
    },
    calculateNextTargetDate: function () {
      if (!vm.selectedRecord.Active()) {
        alert("Record is not active!");
        return;
      }
      let nextTargetDate = new Date();
      let startDate = new Date();
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
          nextTargetDate =
            vm.selectedRecord.EffectivenessVerificationTargetD.date();
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
  };

  self.controls.showSectionByStageKey = function (stage) {
    return ko.pureComputed(function () {
      // Take a stage and compare the current records values to
      // those in stageDescriptions
      if (self.selectedRecord.ProcessStageKey() != stage) {
        return false;
      }

      if (
        !self.selectedRecord.curUserHasRole(
          stageDescriptions[stage].actionTaker
        )
      ) {
        return false;
      }
      return true;
    });
  };

  self.controls.showSectionByStageNum = function (stageNum) {
    return ko.pureComputed(function () {
      if (self.selectedRecord.ProcessStageObj().stageNum < stageNum) {
        return false;
      }
      return true;
    });
  };

  self.controls.rejectStage = function (next) {
    $("#rejectionInformation").modal("show");
  };

  self.controls.rejectStageSubmit = function () {
    // When the user submits the modal with the reason, create a
    // new rejection, then execute the stages reject function
    var next = null;

    var rejectVp = [
      ["Title", self.selectedRecord.Title()],
      ["Reason", self.rejectReason()],
      ["Stage", self.selectedRecord.ProcessStage()],
      ["Date", new Date().toISOString()],
      ["Active", 1],
      ["Rejector", self.currentUser().get_title()],
      [
        "RejectionId",
        self.selectedRecord.Title() +
          "-R" +
          String(self.Rejections().length).padStart(2, "0"),
      ],
    ];

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

    app.listRefs.Rejections.createListItem(rejectVp, next);

    $("#rejectionInformation").modal("hide");
  };
  self.rejectReason = ko.observable();
  self.effectivenessRejectReason = ko.observable();

  self.controls.stage1 = {
    problemApproveQTM: m_fnApproveProblemQTM,
    problemApproveQTMB: m_fnApproveProblemQTMB,
    problemApproveQSO: m_fnApproveProblemQSO,
    problemApproveQAO: m_fnApproveProblemQAO,
  };

  self.controls.stage2 = {
    enableSubmitActionPlan: ko.pureComputed(function () {
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
    showSubmitActionPlan: ko.pureComputed(function () {
      return self.selectedRecord.ProcessStageKey() == "DevelopingActionPlan";
    }),
    submitActionPlan: function () {
      var valuePair = [
        ["ProcessStage", stageDescriptions.PlanApprovalQSO.stage],
        ["SubmittedDate", new Date().toISOString()],
      ];

      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        m_fnRefresh
      );
    },
    planApproveQSO: function () {
      m_fnApprovePlanQSO(self.selectedRecord.ID());
    },
    planRejectQSO: function () {
      m_fnRejectPlanQSO(self.selectedRecord.ID());
    },
    planApproveQTMB: function () {
      m_fnApprovePlanQTMB(self.selectedRecord.ID());
    },
    planRejectQTMB: function () {
      m_fnRejectPlanQTMB(self.selectedRecord.ID());
    },
    planApproveQTM: function () {
      m_fnApprovePlanQTM(self.selectedRecord.ID());
    },
    planRejectQTM: function () {
      m_fnRejectPlanQTM(self.selectedRecord.ID());
    },
  };

  self.controls.stage3 = {
    enableImplementingActionPlan: ko.pureComputed(function () {
      // if (!self.controls.stage3.showImplementingActionPlan()) {
      //   return false;
      // }
      if (self.validateStage.stage3.CompleteActions()) {
        return false;
      }
      if (self.validateStage.stage3.VerificationTargetDate()) {
        return false;
      }
      return true;
    }),
    submitImplementActionPlan: function () {
      var valuePair = [
        ["ProcessStage", stageDescriptions.ImplementationApproval.stage],
        [
          "EffectivenessVerificationTargetD",
          self.selectedRecord.EffectivenessVerificationTargetD.date().toISOString(),
        ],
        ["SubmittedImplementDate", new Date().toISOString()],
      ];

      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        m_fnRefresh
      );
    },
    implementationApproveQSO: m_fnApproveImplement,
  };

  self.controls.stage4 = {
    descOrDocWarningClass: function () {
      return self.validateStage.stage4.DescOrDoc()
        ? "alert-warning"
        : "alert-info";
    },
    enableOfficeImpactBool: function () {
      return (
        vm.selectedRecord.ProcessStageKey() == "EffectivenessSubmission" ||
        vm.selectedRecord.ProcessStageKey() == "EffectivenessSubmissionRejected"
      );
    },
    enableEffectivenessSubmit: function () {
      if (self.validateStage.stage4.OfficeImpact()) {
        return false;
      }
      // If both effectiveness docs and description fail unable to submit
      if (
        self.validateStage.stage4.EffectivenessDocs() &&
        self.validateStage.stage4.EffectivenessDescription()
      ) {
        return false;
      }
      return true;
    },
    showEffectivenessSubmit: ko.pureComputed(function () {
      if (
        self.selectedRecord.ProcessStageKey() != "EffectivenessSubmission" &&
        self.selectedRecord.ProcessStageKey() !=
          "EffectivenessSubmissionRejected"
      ) {
        return false;
      }
      if (!self.selectedRecord.curUserHasRole(ROLES.IMPLEMENTOR)) {
        return false;
      }
      return true;
    }),
    submitEffectiveness: function () {
      var valuePair = [
        ["ProcessStage", stageDescriptions.EffectivenessApprovalQSO.stage],
        ["SubmittedEffectivenessDate", new Date().toISOString()],
      ];
      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        m_fnRefresh
      );
    },
    effectivenessApproveQSO: m_fnApproveEffectivenessQSO,
    effectivenessApproveQTM: m_fnApproveEffectivenessQTM,
    effectivenessApproveQTMB: m_fnApproveEffectivenessQTMB,
  };

  // Validate, all stages should return false if passed
  self.validateStage = {
    stage1: {
      ProblemResolver: ko.pureComputed(function () {
        return (
          self.selectedRecord.ProblemResolverName.ensuredPeople().length === 0
        );
      }),
    },
    stage2: {
      Actions: ko.computed(function () {
        return !self.ActionListItems().length;
      }),
      RootCause: ko.computed(function () {
        return (
          !self.selectedRecord.RootCauseDetermination() &&
          self.selectedRecord.RecordType() == "CAR"
        );
      }),
      RootCauseWhy: ko.computed(function () {
        //if (self.RootCauseWhy() != )
        if (self.selectedRecord.RecordType() == "CAP") {
          return false;
        } else if (!self.RootCauseWhy().length) {
          return true;
        } else {
          return self.RootCauseWhy().length < 1;
        }
      }),
      Nonconformity: ko.computed(function () {
        return (
          !self.selectedRecord.SimilarNoncomformityDesc() &&
          self.selectedRecord.RecordType() == "CAR"
        );
      }),
      ContainmentAction: ko.computed(function () {
        return (
          !self.selectedRecord.ContainmentAction() &&
          self.selectedRecord.RecordType() == "CAR"
        );
      }),
      AddProblemResolver: ko.computed(function () {
        return (
          self.selectedRecord.RecordType() == "CAR" &&
          !self.selectedRecord.ProblemResolverName.ensuredPeople().length &&
          [
            "ProblemApprovalQSO",
            "ProblemApprovalQAO",
            "PlanApprovalQSO",
          ].indexOf(self.selectedRecord.ProcessStageKey()) >= 0
        );
      }),
    },
    stage3: {
      CompleteActions: ko.pureComputed(function () {
        return self.NumOpenActions() > 0;
      }),
      VerificationTargetDate: ko.pureComputed(function () {
        return (
          self.selectedRecord.EffectivenessVerificationTargetD.date().getTime() ==
          0
        );
      }),
      AddSupportDoc: ko.pureComputed(function () {
        return !self.SupportDocuments().length;
      }),
    },
    stage4: {
      EffectivenessDocs: ko.pureComputed(function () {
        return self.EffectivenessDocuments().length == 0;
      }),
      EffectivenessDescription: ko.pureComputed(function () {
        return !self.selectedRecord.EffectivenessDescription();
      }),
      DescOrDoc: ko.pureComputed(function () {
        // See if either the description or document req is satisfied
        return (
          self.validateStage.stage4.EffectivenessDocs() &&
          self.validateStage.stage4.EffectivenessDescription()
        );
      }),
      OfficeImpact: ko.pureComputed(function () {
        return !self.selectedRecord.OfficeImpactDesc();
      }),
    },
  };

  /******************************** Rejection Alert Logic ***************************/

  self.Rejections = ko.observableArray();

  /******************************** Action Tables Logic ***************************/

  /******************************** CAP/CAR Tables Logic ***************************/
  self.highlightOverdue = function (record) {
    const targetDate =
      record.NextTargetDate !== "undefined" && record.NextTargetDate
        ? new Date(record.NextTargetDate)
        : null;

    let today = new Date(new Date().toDateString());
    //today.setDate(today.getDate() - 1)
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

  self.formatNextTargetDate = function (record) {
    if (record == undefined) {
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

  /******************************** Document Tables Logic ***************************/
  self.formatDocDownloadLink = function (link) {
    return "../_layouts/download.aspx?SourceUrl=" + link;
  };

  /******************************** Lock Editing Logic ***************************/
}

var vm = {};
