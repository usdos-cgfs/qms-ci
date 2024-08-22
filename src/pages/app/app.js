import { getUrlParam, setUrlParam } from "../../common/router.js";
import { Tab, TabsModule } from "../../components/tabs/tabs.js";
import { makeDataTable } from "../../common/data-table.js";

import { InitSal, sortByTitle } from "../../sal/infrastructure/index.js";
import { appContext } from "../../infrastructure/app-db-context.js";

import * as ModalDialog from "../../sal/components/modal/index.js";
import * as FormManager from "../../sal/infrastructure/form_manager.js";
import {
  businessOfficeStore,
  sourcesStore,
} from "../../infrastructure/store.js";
import {
  Action,
  Plan,
  Rejection,
  RootCauseWhy,
  SupportingDocument,
} from "../../entities/index.js";

import {
  ROLES,
  LOCATION,
  stageDescriptions,
  SUPPORTINGDOCUMENTTYPES,
} from "../../constants.js";

import { EditActionForm, NewPlanForm } from "../../forms/index.js";

import {
  editAction,
  getNextActionId,
  submitNewAction,
} from "../../services/actions-service.js";
import {
  DateField,
  PeopleField,
  TextAreaField,
} from "../../sal/fields/index.js";
import { editPlan } from "../../services/plan-service.js";

import {
  addTask,
  blockingTasks,
  finishTask,
  runningTasks,
  tasks,
} from "../../services/tasks-service.js";
import { CancelPlanForm } from "../../forms/plan/cancel/cancel-plan-form.js";
import {
  currentRole,
  currentUser,
  userRoleOpts,
} from "../../services/authorization.js";

import {
  stageApprovedNotification,
  stageRejectedNotification,
} from "../../services/notifications-service.js";

// import { CAPViewModel } from "../../vm.js";
/*      app-main.js

    SPA used by CAP/CAR Submitters, QSO's/
    QAO's, and QTM for CAP/CAR monitoring and adjudication.

    App Dependencies: ViewModels.js, SAL.js, CAPColumnsMapping.js
    Library Dependencies: knockout 3.4, jquery 3.3

    Author: Peter Backlund
    Email: backlundpf <@> state.gov
    Date Created: 2018-12-18

*/

/*
    TODO:
    Important - 
    x Add target implementation date.
    Actions sent to QTM after second revision.
    x Legend for CAP Process Stage
    Add link to record version history
    x Remove implementation remark, just have a mark as complete option.
    x Add rejection entities.
    Howto send to QAO after QSO rejection?

    TODO PURGE:
    EffectivenessProcessStage
    DateSubmitted

    Other -
    Once a CAP is approved, we need to reload the main data so it disappears from the "Awaiting Approval"
    Archive previously closed caps
    Status bar
*/
window.app = window.app || {};

var timer = null;
var refreshInterval = 100 * 60 * 1000; // 10 minutes

function refreshPageInterval() {
  clearTimeout(timer);
  timer = setTimeout(function () {
    window.location.reload(true);
  }, refreshInterval);
}

$(document).mousemove(refreshPageInterval);

Date.prototype.toDateInputValue = function () {
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

function isRecordOwner() {
  // Check if we are listed as the QAO or QSO
  vm.selectedRecord.curUserHasRole(ROLES.QSO);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// Check if any of our rejections have negated by making it passed their stage.
function approveUpdateRejections() {
  var valuepair = [["Active", 0]];
  var rejectionsToClose = [];
  var curStageIndex = vm
    .stageDescriptionsArray()
    .findIndex(function (stageDesc) {
      return stageDesc.stage == vm.selectedRecord.ProcessStage();
    });
  vm.Rejections().forEach(function (item, idx, arr) {
    var rejectionStageIndex = vm
      .stageDescriptionsArray()
      .findIndex(function (stageDesc) {
        return stageDesc.stage == item.Stage;
      });
    if (rejectionStageIndex) {
      if (rejectionStageIndex <= curStageIndex) {
        // push this rejection to the list of rejections we're closing.
        rejectionsToClose.push(item.ID);
        //UpdateRejectionItemValuePair(item.RejectionId, valuepair);
      }
    }
  });

  // We don't need to track the number of items since our calling
  // function should be handling it.

  rejectionsToClose.forEach(function (id) {
    app.listRefs.Rejections.updateListItem(id, valuepair, function () {});
  });
}

// $("#tabs").on("click", function () {
//   // curPath = location.href;
//   vm.tab($("#tabs").tabs("option", "active"));

//   //history.pushState({}, "", curPath);
// });

/********************************************************************************/
/*                                        Tab 0                                 */
/********************************************************************************/

/********************************************************************************/
/*                                        Tab 1                                 */
/********************************************************************************/
// Refresh button
$("#linkRefresh").click(m_fnRefresh);
// Initial Submission

//          STAGE 1:
$("#warnAddProblemResolver").click(function () {
  document.getElementById("divInformation").scrollIntoView();
});

//          STAGE 2: Develop Action Plan
// set the CAPs Process Stage to Submit for QSO Approval
$("#warnAddAction").click(function () {
  document.getElementById("cardAwaitingActionList").scrollIntoView();
});

$("#warnAddContainmentAction").click(function () {
  document.getElementById("cardContainmentAction").scrollIntoView();
});

$("#warnAddWhy").click(function () {
  document.getElementById("rootCauseDiv").scrollIntoView();
});

$("#warnAddRootCause").click(function () {
  document.getElementById("rootCauseDiv").scrollIntoView();
});

$("#warnAddSimilarNoncomformity").click(function () {
  document.getElementById("cardSimilarNoncomformities").scrollIntoView();
});

$("#warnAddProblemResolver2").click(function () {
  document.getElementById("divInformation").scrollIntoView();
});

//          STAGE 3: Work Actions
// Implementation Submission
$("#warnCompleteActions").click(function () {
  document.getElementById("cardAwaitingActionList").scrollIntoView();
});

$("#warnAddSupportingDoc").click(function () {
  document.getElementById("cardSupportingDocuments").scrollIntoView();
});

//          STAGE 4: Effectiveness
// Effectiveness Actions
$("#warnAddEffectivenessDoc").click(function () {
  document.getElementById("cardEffectivenessDocuments").scrollIntoView();
});

/* Documents */

// CAR Specific
//Problem description

// Action List
$("#buttonSubmitNewAction").click(function () {
  if (vm.controls.allowSubmitNewAction()) {
    m_fnCreateAction(vm.CAPID(), OnActionCreateCallback);
  }
});

/********************************************************************************/
/*                                        Tab 4 lookup                          */
/********************************************************************************/

$("#btnRequestAllRecords").click(LoadMainData);

// Tab 0 My CAP Table configuration:

//TAB 1

// Loading CAP data
// This is where we structure the query for what get's loaded on main tab page and the drop-down on the specific record page.
function LoadMainData(next) {
  const refreshTask = addTask(tasks.refreshPlans);
  document.getElementById("spanLoadStatus").innerText = "Loading Data";
  next = next ? next : function () {};
  var dataLoadIncrementer = new Incremental(0, 3, () => {
    finishTask(refreshTask);
    next();
  });
  // Let's load our Actions and our Items
  app.listRefs.Plans.getListItems("", function (plans) {
    vm.allRecordsArray(plans);
    document.getElementById("spanLoadStatus").innerText = "Plans Loaded";
    dataLoadIncrementer.inc();
  });

  app.listRefs.Actions.getListItems("", function (actions) {
    vm.allActionsArray(actions);
    document.getElementById("spanLoadStatus").innerText = "Actions Loaded";
    dataLoadIncrementer.inc();
  });

  app.listRefs.BusinessOffices.getListItems("", function (offices) {
    vm.allBusinessOffices(offices);
    document.getElementById("spanLoadStatus").innerText = "Offices Loaded";
    dataLoadIncrementer.inc();
  });

  app.listRefs.TempQOs.getListItems("", function (offices) {
    vm.allTempQOs(offices);
    document.getElementById("spanLoadStatus").innerText = "QOs Loaded";
    dataLoadIncrementer.inc();
  });
}

function loadSelectedRecordByObj(record) {
  LoadSelectedCAP(record.Title);
}
// IMPORTANT - use this section to hide and show elements to the user based on permission level.
async function LoadSelectedCAP(capid) {
  const viewTask = addTask(tasks.view);

  var capid = capid.Title ? capid.Title : capid;

  // New Application Structure
  const plan = await appContext.Plans.FindByTitle(capid);
  if (plan?.results.length) vm.selectedPlan(plan.results.pop());

  // Check if we are being passed an object
  //capid = capid.Title;

  var selectedRecordObj = vm.allRecordsArray().find(function (record) {
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

  // Fetch related data
  var camlQ =
    "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" +
    capid +
    "</Value></Eq></Where><OrderBy><FieldRef Name='Title' Ascending='FALSE'/></OrderBy></Query></View>";

  //loadRejections();
  app.listRefs.Rejections.getListItems(camlQ, (rejections) => {
    incrementer.inc();
    vm.Rejections(rejections);
  });
  // loadStatusLegend();

  var docsCamlQ =
    "<View Scope='RecursiveAll'><Query><Where><Eq><FieldRef Name='Record'/><Value Type='Text'>" +
    capid +
    "</Value></Eq></Where><OrderBy><FieldRef Name='Title' Ascending='FALSE'/></OrderBy></Query></View>";

  app.listRefs.SupportDocs.getListItems(docsCamlQ, (docs) => {
    incrementer.inc();
    vm.selectedDocuments(docs);
  });

  //hideEditFields();

  if (vm.selectedRecord.RecordType() == "CAR") {
    incrementer.incTarget();
    var camlQ =
      "<View><Query><Where><Contains><FieldRef Name='Title'/><Value Type='Text'>" +
      capid +
      "</Value></Contains></Where><OrderBy><FieldRef Name='Number' Ascending='TRUE'/></OrderBy></Query></View>";

    app.listRefs.Whys.getListItems(camlQ, (whys) => {
      vm.RootCauseWhy(whys);
      incrementer.inc();
    });
  }
  //loadStages();
}

/************************************************************
 * Logic for action items
 ************************************************************/

/**********************************************************************************************/
/*                               APPROVALS AND REJECTIONS EVENT HANDLERS                                  */
/**********************************************************************************************/
/* Problem Approval */
function m_fnApproveProblemQSO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QSOProblemAdjudication", "Approved"],
    ["SubmittedDate", ts],
    ["QSOProblemAdjudicationDate", ts],
    ["ProcessStage", "Developing Action Plan"],
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnApproveProblemQAO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QAO)) {
    alert('You don\'t have the correct role "QAO" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QAOProblemAdjudication", "Approved"],
    ["SubmittedDate", ts],
    ["QAOProblemAdjudicationDate", ts],
    ["ProcessStage", "Developing Action Plan"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnApproveProblemQTMB() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QMSBProblemAdjudication", "Approved"],
    ["QMSBProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QTM Problem Approval"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}
function m_fnApproveProblemQTM() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  const today = new Date();
  const target_deadline = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  ).toISOString();

  var valuePair = [
    ["QTMProblemAdjudication", "Approved"],
    ["QTMProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QSO Problem Approval"],
    ["NextTargetDate", target_deadline],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnRejectProblemQSO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QSOProblemAdjudication", "Rejected"],
    ["QSOProblemAdjudicationDate", ts],
    ["ProcessStage", "Pending QAO Problem Approval"],
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}
function m_fnRejectProblemQAO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QAO)) {
    alert('You don\'t have the correct role "QAO" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QAOProblemAdjudication", "Rejected"],
    ["QAOProblemAdjudicationDate", ts],
    ["ProcessStage", "Editing"],
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectProblemQTMB(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QMSBProblemAdjudication", "Rejected"],
    ["QMSBAdjudicationDate", ts],
    ["ProcessStage", "Editing"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectProblemQTM(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QTMProblemAdjudication", "Rejected"],
    ["QTMProblemAdjudicationDate", ts],
    ["ProcessStage", "Editing"],
  ];
  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

/* Plan Approval */
function m_fnApprovePlanQSO(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QSOApprovalStatus", "Approved"],
    ["QSOAdjudicationDate", ts],
  ];
  switch (vm.selectedRecord.CGFSLocation()) {
    case "Bangkok":
      valuePair.push([
        "ProcessStage",
        stageDescriptions.PlanApprovalQTMB.stage,
      ]);
      break;
    default:
      valuePair.push(["ProcessStage", stageDescriptions.PlanApprovalQTM.stage]);
  }

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnApprovePlanQTMB(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QMSBApprovalStatus", "Approved"],
    ["QMSBAdjudicationDate", ts],
    ["ProcessStage", "Pending QTM Plan Approval"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnApprovePlanQTM(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QTMApprovalStatus", "Approved"],
    ["QTMAdjudicationDate", ts],
    ["ProcessStage", "Implementing Action Plan"],
    [
      "NextTargetDate",
      new Date(vm.selectedRecord.ImplementationTargetDate.date()).toISOString(),
    ],
  ];
  activateActions(function () {
    app.listRefs.Plans.updateListItem(
      planId,
      valuePair,
      onStageApprovedCallback
    );
  });
}

function activateActions(callback) {
  var pendingActions = vm.ActionListItems().filter(function (action) {
    return action.ImplementationStatus == ACTIONSTATE.PENDINGAPPROVAL;
  });

  if (!pendingActions.length) {
    callback();
    return;
  }

  var actionInc = new Incremental(0, pendingActions.length, callback);

  pendingActions.forEach(function (action) {
    app.listRefs.Actions.updateListItem(
      action.ID,
      [["ImplementationStatus", ACTIONSTATE.INPROGRESS]],
      function () {
        // increment the counter
        actionInc.inc();
      }
    );
  });
}

// Plan Rejections
function m_fnRejectPlanQSO(callback) {
  var planId = vm.selectedRecord.ID();

  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QSOApprovalStatus", "Rejected"],
    ["QSOAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage,
    ],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectPlanQTMB(callback) {
  var planId = vm.selectedRecord.ID();

  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QMSBApprovalStatus", "Rejected"],
    ["QMSBAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage,
    ],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectPlanQTM(callback) {
  var planId = vm.selectedRecord.ID();

  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QTMApprovalStatus", "Rejected"],
    ["QTMAdjudicationDate", ts],
    [
      "ProcessStage",
      stageDescriptions[vm.selectedRecord.ProcessStageObj().onReject()].stage,
    ],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

/* Implementation Approval */

function m_fnApproveImplement() {
  var planId = vm.selectedRecord.ID();
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["ProcessStage", "Pending Effectiveness Submission"],
    ["QSOImplementAdjudication", "Accepted"],
    ["QSOImplementAdjudicationDate", ts],
    [
      "NextTargetDate",
      new Date(
        vm.selectedRecord.EffectivenessVerificationTargetD.date()
      ).toISOString(),
    ],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

// Set the CAPProcessStage to Pending QSO Approval
function m_fnRejectImplement(callback) {
  var planId = vm.selectedRecord.ID();
  var ts = new Date().toISOString();
  var valuePair = [
    ["ProcessStage", "Implementing Action Plan"],
    ["QSOImplementAdjudication", "Rejected"],
    ["QSOImplementAdjudicationDate", ts],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

/* Effectiveness Approval and Verification Stage */
function m_fnApproveEffectivenessQSO() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QSOEffectivenessAdjudication", "Accepted"],
    ["QSOEffectivenessAdjudicationDate", ts],
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
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QMSBEffectivenessAdjudication", "Accepted"],
    ["QMSBEffectivenessAdjudicationDat", ts],
    ["ProcessStage", "Pending QTM Effectiveness Approval"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnApproveEffectivenessQTM() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  approveUpdateRejections();
  var ts = new Date().toISOString();
  var valuePair = [
    ["QTMEffectivenessAdjudication", "Accepted"],
    ["QTMEffectivenessAdjudicationDate", ts],
    ["NextTargetDate", new Date(0).toISOString()],
    ["ProcessStage", "Closed: Accepted"],
    ["Active", "0"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, onStageApprovedCallback);
}

function m_fnRejectEffectivenessQSO(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QSO)) {
    alert('You don\'t have the correct role "QSO" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var rejectReason = vm.effectivenessRejectReason();

  var valuePair = [
    ["QSOEffectivenessAdjudication", "Rejected"],
    ["QSOEffectivenessAdjudicationDate", ts],
  ];

  switch (rejectReason) {
    case "Lack of Evidence":
      // Sent back for lack of evidence, add more effectiveness docs
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected",
      ]);
      break;
    case "Not Effective":
      // CAP was ineffective, we need to send it all the way back to the implementation stage.
      // TODO: Should we clear everything else here as well?
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectEffectivenessQTMB(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTMB" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var rejectReason = vm.effectivenessRejectReason();

  var valuePair = [
    ["QMSBEffectivenessAdjudication", "Rejected"],
    ["QMSBEffectivenessAdjudicationDat", ts],
  ];

  switch (rejectReason) {
    case "Lack of Evidence":
      // Sent back for lack of evidence, add more effectiveness docs
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected",
      ]);
      break;
    case "Not Effective":
      // CAP was ineffective, we need to send it all the way back to the implementation stage.
      // TODO: Should we clear everything else here as well?
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

function m_fnRejectEffectivenessQTM(callback) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTM)) {
    alert('You don\'t have the correct role "QTM" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var rejectReason = vm.effectivenessRejectReason();

  var valuePair = [
    ["QTMEffectivenessAdjudication", "Rejected"],
    ["QTMEffectivenessAdjudicationDate", ts],
  ];

  switch (rejectReason) {
    case "Lack of Evidence":
      // Sent back for lack of evidence, add more effectiveness docs
      valuePair.push([
        "ProcessStage",
        "Pending Effectiveness Submission: Rejected",
      ]);
      break;
    case "Not Effective":
      // CAP was ineffective, we need to send it all the way back to the implementation stage.
      // TODO: Should we clear everything else here as well?
      valuePair.push(["ProcessStage", "Developing Action Plan"]);
      break;
  }

  app.listRefs.Plans.updateListItem(planId, valuePair, callback);
}

/* CALLBACKS AND PAGE MANIPULATIONS */

function m_fnRefresh(result, value) {
  if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
    return;
  }
  addTask(tasks.refresh);
  LoadMainData(function () {
    LoadSelectedCAP(vm.selectedTitle());
    finishTask(tasks.refresh);
  });
}

async function onStageApprovedCallback(result) {
  if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
    return;
  }
  const refreshTask = addTask(tasks.refresh);

  LoadMainData(async function () {
    await LoadSelectedCAP(vm.selectedTitle());
    const plan = ko.unwrap(vm.selectedPlan);
    await stageApprovedNotification(plan);
    finishTask(refreshTask);
  });
}

async function onStageRejectedCallback(plan, rejection) {
  // if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
  //   return;
  // }
  return new Promise((resolve) => {
    const refreshTask = addTask(tasks.refresh);

    LoadMainData(async function () {
      await LoadSelectedCAP(vm.selectedTitle());
      const plan = ko.unwrap(vm.selectedPlan);
      await stageRejectedNotification(plan, rejection);
      finishTask(refreshTask);
      resolve();
    });
  });
}

function OnCapCreateCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    addTask(tasks.refreshPlans);
    app.listRefs.Plans.getListItems("", function (items) {
      var id = items[items.length - 1];
      vm.allRecordsArray(items);
      vm.selectedTitle(id.Title);
      vm.tab(TABS.PLANDETAIL);
      finishTask(tasks.refreshPlans);
      // m_fnForward();
    });
  }
}

function OnCapEditRefresh(result, value) {
  // result = 1 is OK
  // result = 0 is Cancel
  // result = -1 is Uh oh, something is wrong
  //TODO: Check if the processstage is now closed.
  if (result === SP.UI.DialogResult.OK) {
    m_fnRefresh();
  }
}

function OnActionEditCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    addTask(tasks.newAction);
    app.listRefs.Actions.getListItems("", function (actions) {
      vm.allActionsArray(actions);
      vm.controls.record.updateImplementationDate();
      finishTask(tasks.newAction);
    });
  }
}

function OnActionCreateCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    addTask(tasks.newAction);
    // The user has modified the Action, the Associated CAP must be updated.
    app.listRefs.Actions.getListItems("", function (actions) {
      vm.allActionsArray(actions);
      vm.controls.record.updateImplementationDate();
      finishTask(tasks.newAction);
    });
  }
}

function OnCallbackFormRefresh(result, value) {
  // result = 1 is OK
  // result = 0 is Cancel
  // result = -1 is Uh oh, something is wrong
  if (result === SP.UI.DialogResult.OK) {
    m_fnRefresh();
  }
}

function closePlan(id, { title, newStage, prevStage, cancelReason }) {
  addTask(tasks.closing);
  valuePair = [
    ["ProcessStage", newStage],
    ["Active", "0"],
    ["PreviousStage", prevStage],
    ["CloseDate", new Date().toISOString()],
    ["CancelReason", cancelReason],
  ];

  app.listRefs.Plans.updateListItem(id, valuePair, function () {
    //   toggleLockPlan(title, true, function () {
    //     alert("Plan has been locked. Please contact QTM to Re-Open.");
    //     m_fnRefresh();
    //   });
    m_fnRefresh();
    finishTask(tasks.closing);
  });
}
// var incrementer;

/**
 *
 * @param {string} title the title of the plan e.g. C20-030
 * @param {bool} lock pass true to lock request
 */
function toggleLockPlan(title, lock, callback) {
  addTask(tasks.lock);
  callback = callback === undefined ? m_fnRefresh : callback;
  // Pass true to lock request

  // Set permissions on list first
  var listRefs = [
    app.listRefs.Plans,
    app.listRefs.Actions,
    app.listRefs.Rejections,
    app.listRefs.Whys,
  ];

  var incrementer = new Incremental(0, listRefs.length, () => {
    finishTask(tasks.lock);
    callback();
  });

  var camlq =
    '<View Scope="RecursiveAll"><Query><Where><And><Eq>' +
    '<FieldRef Name="FSObjType"/><Value Type="int">0</Value>' +
    "</Eq><Eq>" +
    '<FieldRef Name="FileRef"/><Value Type="Text">' +
    title +
    "</Value>" +
    "</Eq></And></Where></Query><RowLimit>1</RowLimit></View>";

  var vp = [
    ["Submitters", "Restricted Read"],
    ["QOs", "Restricted Read"],
    ["QTM", "Restricted Contribute"],
    ["QTM B", "Restricted Contribute"],
  ];

  listRefs.forEach(function (list) {
    list.getListItems(camlq, function (items) {
      items.forEach((item) => {
        incrementer.incTarget();
        if (lock) {
          list.setItemPermissions(
            item.ID,
            vp,
            function () {
              console.log(
                "Updated item perms " +
                  list.config.def.name +
                  " " +
                  incrementer.val()
              );
              incrementer.inc();
            },
            true
          );
        } else {
          list.resetItemPermissions(item.ID, function () {
            console.log(
              "Updated item perms " +
                list.config.def.name +
                " " +
                incrementer.val()
            );
            incrementer.inc();
          });
        }
      });
      incrementer.inc();
    });
  });

  var listRefWithFolders = [app.listRefs.SupportDocs];
  // Now break support docs permissions
  var camlqFolder =
    '<View Scope="RecursiveAll"><Query><Where><And><Eq>' +
    '<FieldRef Name="FSObjType"/><Value Type="int">1</Value>' +
    "</Eq><Eq>" +
    '<FieldRef Name="FileLeafRef"/><Value Type="Text">' +
    title +
    "</Value>" +
    "</Eq></And></Where></Query><RowLimit>1</RowLimit></View>";

  listRefWithFolders.forEach(function (list) {
    incrementer.incTarget();
    list.getListItems(camlqFolder, function (items) {
      if (items[0]) {
        incrementer.incTarget();
        var item = items[0];
        if (lock) {
          list.setItemPermissions(
            item.ID,
            vp,
            function () {
              console.log(
                "Updated item perms " +
                  list.config.def.name +
                  " " +
                  incrementer.val()
              );
              incrementer.inc();
            },
            true
          );
        } else {
          list.resetItemPermissions(item.ID, function () {
            console.log(
              "Updated item perms " +
                list.config.def.name +
                " " +
                incrementer.val()
            );
            incrementer.inc();
          });
        }
      }
    });
    incrementer.inc();
  });
}

function initComplete() {
  ko.applyBindings(vm);
  document.getElementById("spanLoadStatus").innerText = "Building Interface";

  vm.currentUser(sal.globalConfig.currentUser);
  var tabId = getUrlParam("tab");
  var capid = getUrlParam("capid");

  $("#showme").hide();

  $("#tabs").show();
  // $("#tabs").tabs();

  if (!tabId) {
    let defaultTab = vm.tabOpts.myPlans;
    switch (vm.AdminType()) {
      case ROLES.ADMINTYPE.QO:
        defaultTab = vm.tabOpts.qo;
        break;
      case ROLES.ADMINTYPE.QTM:
        defaultTab = vm.tabOpts.all;
        break;
      case ROLES.ADMINTYPE.QTMB:
        defaultTab = vm.tabOpts.qtmb;
        break;
      default:
    }

    vm.tabs.selectById(defaultTab);
  }
  if (capid) {
    vm.CAPID(capid);
    vm.selectedTitle(capid);
    //LoadSelectedCAP(capid);
    //$("#ddlCAPID").val(capid);
  }
  // makeDataTable("#tblMyOpenRecords");
  // makeDataTable("#tblQOOpenRecords");
  // makeDataTable("#tblQTMBOpenRecords");
  // makeDataTable("#tblAllOpenRecords");
  // makeDataTable("#tblMyAwaitingActionRecords");
  // makeDataTable("#tblAwaitingAction");
  // makeDataTable("#tblLookupRecords");

  finishTask(tasks.init);

  // var idTab =
  // $('#injectAdditionalTabs').
  loadFinish = new Date();
  var loadTimeSeconds = (loadFinish - loadStart) / 1000;
  vm.appLoadTime(loadTimeSeconds + "s");
  console.log("Application Load Time: ", (loadFinish - loadStart) / 1000);
}

var loadStart,
  loadFinish = 0;

async function initApp() {
  loadStart = new Date();
  initSal();
  InitSal();
  Common.Init();
  document.getElementById("spanLoadStatus").innerText =
    "Initiating Application";
  vm = await App.Create();
  const initTask = addTask(tasks.init);
  initStaticListRefs();

  LoadMainData(initComplete); // This will call initComplete() when all data is loaded
}

/***************************** COPY PASTE VM CONTENTS *****************************/
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
window.ROLES = ROLES;

var EXTENSIONDAYS = 45;

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
  let vf = "<ViewFields>";
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
  "AuthorName",
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
export function CAPViewModel(capIdstring) {
  console.log("evaluating viewmodel");
  var self = this;

  // self.currentUser = ko.observable(
  //   $().SPServices.SPGetCurrentUser({
  //     fieldName: "Title",
  //     debug: false,
  //   })
  // );
  var APPPROCESSTIMEOUT = 10 * 1000; // 10 seconds
  var APPPROCESSDISMISSTIMEOUT = 1000;
  self.app = {
    currentDialogs: ModalDialog.currentDialogs,
  };

  self.bindingCompleteHandlers = {
    tableBound: function (nodes) {
      var tableId = nodes.id;
      makeDataTable(tableId);
    },
  };
  self.stageDescriptionsArray = ko.pureComputed(function () {
    return Object.keys(stageDescriptions).map(function (key) {
      return stageDescriptions[key];
    });
  });

  self.impersonateUserField = new PeopleField({
    displayName: "Impersonate User",
  });

  self.impersonateUserField.Value.subscribe(function (people) {
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

  // Default adminType to that provided on page.
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
        data: self,
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES.ADMINTYPE.QTM;
      }),
    }),
    qtmb: new Tab({
      urlKey: "qtmb",
      linkText: "Bangkok Open CARs/CAPs",
      template: {
        id: "tabs-qtmb",
        data: self,
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES.ADMINTYPE.QTMB;
      }),
    }),
    myPlans: new Tab({
      urlKey: "my-plans",
      linkText: "My CARs/CAPs",
      template: {
        id: "tabs-my-plans",
        data: self,
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES.ADMINTYPE.USER;
      }),
    }),
    qo: new Tab({
      urlKey: "qo",
      linkText: "QO CARs/CAPs",
      template: {
        id: "tabs-qo",
        data: self,
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES.ADMINTYPE.QO;
      }),
    }),
    detail: new Tab({
      urlKey: "detail",
      linkText: "CAR/CAP Details",
      template: {
        id: "tabs-detail",
        data: self,
      },
    }),
    awaitingAction: new Tab({
      urlKey: "awaiting",
      linkText: "Awaiting Action",
      template: {
        id: "tabs-awaiting",
        data: self,
      },
      visible: ko.pureComputed(() => {
        return self.AdminType() == ROLES.ADMINTYPE.USER;
      }),
    }),
    lookup: new Tab({
      urlKey: "lookup",
      linkText: "Lookup",
      template: {
        id: "tabs-lookup",
        data: self,
      },
    }),
  };
  self.tabs = new TabsModule(Object.values(self.tabOpts));

  // self.tab = ko.observable();

  // self.tab.subscribe(function (newTab) {
  //   // $("#tabs").tabs("option", "active", newTab);
  //   Common.Utilities.updateUrlParam("tab", newTab.toString());
  // });

  self.navigateToRecord = async function (record) {
    vm.CAPID(record.Title);
    //Common.Utilities.updateUrlParam("capid", record.Title);
    //LoadSelectedCAP(record.Title);
    vm.selectedTitle(record.Title);

    vm.tabs.selectTab(self.tabOpts.detail);
  };

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
        tempCoordinator: new PeopleField({
          displayName: "CAR/CAP Coordinator",
        }),
        edit: function () {
          if (self.selectedRecord.ProblemResolverName.ensuredPeople().length) {
            self.section.Info.coordinator.tempCoordinator.set(
              self.selectedRecord.ProblemResolverName.ensuredPeople()[0]
            );
          }
          self.section.Info.coordinator.isEditing(true);
        },
        save: function () {
          self.selectedRecord.ProblemResolverName.removeAllPeople();
          const coord = self.section.Info.coordinator.tempCoordinator.Value();
          const coordString = `${coord.ID};#${coord.LoginName};#`;
          var valuePair = [
            ["ProblemResolverName", coordString],
            ["CoordinatorName", coord.Title],
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
      field: new TextAreaField({
        displayName: "Opportunity for Improvement",
        isRichText: true,
      }),
      edit: function () {
        self.section.OpportunityForImprovement.field.Value(
          self.selectedRecord.OFIDescription()
        );
        self.section.OpportunityForImprovement.isEditing(true);
      },
      save: function () {
        var valuepair = [
          [
            "OFIDescription",
            self.section.OpportunityForImprovement.field.Value(),
          ],
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
      field: new TextAreaField({
        displayName: "Data Discovery and Analysis",
        isRichText: true,
      }),
      edit: function () {
        self.section.DiscoveryDataAnalysis.field.Value(
          self.selectedRecord.DiscoveryDataAnalysis()
        );
        self.section.DiscoveryDataAnalysis.isEditing(true);
      },
      save: function () {
        var valuepair = [
          [
            "DiscoveryDataAnalysis",
            self.section.DiscoveryDataAnalysis.field.Value(),
          ],
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
      field: new TextAreaField({
        displayName: "Problem Description",
        isRichText: true,
      }),
      edit: function () {
        self.section.ProblemDescription.field.Value(
          self.selectedRecord.ProblemDescription()
        );
        self.section.ProblemDescription.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["ProblemDescription", self.section.ProblemDescription.field.Value()],
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
      field: new TextAreaField({
        displayName: "Containment Action",
        isRichText: true,
      }),
      actionDate: new DateField({ displayName: "Containment Action Date" }),
      edit: function () {
        self.section.ContainmentAction.field.Value(
          self.selectedRecord.ContainmentAction()
        );
        // If our datetime is set
        if (
          self.selectedRecord.ContainmentActionDate.isDate() &&
          self.selectedRecord.ContainmentActionDate.date().getTime()
        ) {
          self.section.ContainmentAction.actionDate.set(
            self.selectedRecord.ContainmentActionDate.date()
          );
        }
        self.section.ContainmentAction.isEditing(true);
      },
      save: function () {
        var valuepair = [
          ["ContainmentAction", self.section.ContainmentAction.field.Value()],
          [
            "ContainmentActionDate",
            self.section.ContainmentAction.actionDate.get() ??
              new Date(0).toISOString(),
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
        const rootCauseWhy = new RootCauseWhy();

        const planNum = self.selectedRecord.Title();
        const actionNumber = self.RootCauseWhy().length
          ? self.RootCauseWhy().length + 1
          : 1;

        const title = `${planNum}-${actionNumber}`;

        rootCauseWhy.Title.Value(title);
        rootCauseWhy.Number.Value(actionNumber);

        const form = FormManager.NewForm({
          entity: rootCauseWhy,
        });

        const options = {
          title: "New Why",
          form,
          dialogReturnValueCallback: OnCallbackFormRefresh,
        };

        ModalDialog.showModalDialog(options);
      },
      editWhy: async function (why) {
        const rootCauseWhy = await appContext.RootCauseWhys.FindById(why.ID);

        const form = FormManager.EditForm({ entity: rootCauseWhy });

        const options = {
          title: "Edit Why",
          form,
          dialogReturnValueCallback: OnCallbackFormRefresh,
        };

        ModalDialog.showModalDialog(options);
      },
      editWhyDeprecated: function (why) {
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
        const planNum = self.selectedRecord.Title();

        const supportingDocument = new SupportingDocument();
        supportingDocument.Record.Value(planNum);
        supportingDocument.DocType.Value(SUPPORTINGDOCUMENTTYPES.SUPPORT);

        const folderPath = planNum;

        const form = FormManager.UploadForm({
          entity: supportingDocument,
          folderPath,
          view: SupportingDocument.Views.Edit,
        });

        const options = {
          title: "Upload New Supporting Document",
          form,
          dialogReturnValueCallback: m_fnRefresh,
        };

        ModalDialog.showModalDialog(options);
      },
      view: async function (doc) {
        const supportingDocument =
          await appContext.SupportingDocuments.FindById(doc.ID);

        const form = FormManager.DispForm({ entity: supportingDocument });

        const options = {
          title: "View Document",
          form,
        };

        ModalDialog.showModalDialog(options);
      },
      edit: async function (doc) {
        const supportingDocument =
          await appContext.SupportingDocuments.FindById(doc.ID);

        const form = FormManager.EditForm({
          entity: supportingDocument,
          view: SupportingDocument.Views.Edit,
        });

        const options = {
          title: "Edit Document",
          form,
          dialogReturnValueCallback: m_fnRefresh,
        };

        ModalDialog.showModalDialog(options);
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
      new: async function () {
        const planNum = self.selectedRecord.Title();
        const nextActionId = getNextActionId(planNum, self.ActionListItems());

        const action = new Action();

        action.Title.Value(planNum);
        action.ActionID.Value(nextActionId);

        const form = FormManager.NewForm({
          entity: action,
          view: Action.Views.New,
          onSubmit: () => submitNewAction(null, action),
        });

        const options = {
          title: "New Action",
          form,
          dialogReturnValueCallback: OnActionCreateCallback,
        };

        ModalDialog.showModalDialog(options);
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
      editClick: async function (action) {
        const entity = await appContext.Actions.FindById(action.ID);
        const planId = self.selectedRecord.ID();
        const plan = await appContext.Plans.FindById(planId);

        const form = new EditActionForm({ entity, plan });

        const options = {
          title: "Editing Action " + entity.ActionID.Value(),
          form,
          dialogReturnValueCallback: OnActionEditCallback,
        };

        ModalDialog.showModalDialog(options);
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

          vm.controls.record.updateImplementationDate();
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

          vm.controls.record.updateImplementationDate();
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
            const planNum = self.selectedRecord.Title();

            const supportingDocument = new SupportingDocument();
            supportingDocument.Record.Value(planNum);
            supportingDocument.DocType.Value(
              SUPPORTINGDOCUMENTTYPES.EFFECTIVENESS
            );

            const folderPath = planNum;

            const form = FormManager.UploadForm({
              entity: supportingDocument,
              folderPath,
              view: SupportingDocument.Views.Edit,
            });

            const options = {
              title: "Upload New Proof of Effectiveness Document",
              form,
              dialogReturnValueCallback: m_fnRefresh,
            };

            ModalDialog.showModalDialog(options);
          },
          view: async function (doc) {
            const supportingDocument =
              await appContext.SupportingDocuments.FindById(doc.ID);

            const form = FormManager.DispForm({ entity: supportingDocument });

            const options = {
              title: "View Document",
              form,
            };

            ModalDialog.showModalDialog(options);
          },
          edit: async function (doc) {
            const supportingDocument =
              await appContext.SupportingDocuments.FindById(doc.ID);

            const form = FormManager.EditForm({
              entity: supportingDocument,
              view: SupportingDocument.Views.Edit,
            });

            const options = {
              title: "Edit Document",
              form,
              dialogReturnValueCallback: m_fnRefresh,
            };

            ModalDialog.showModalDialog(options);
          },
        },
      },
    },
  };

  self.selectedPlan = ko.observable();

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
      "/SitePages/print.aspx?capid=" +
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
  const sortByCreatedDesc = function (item1, item2) {
    return item1.Created < item2.Created ? 1 : -1;
  };
  const sortByTitle = function (item1, item2) {
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

  const getNextItemCntByType = function (type) {
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

    return records.length + 1;
  };

  function GetNewID(type, count) {
    var id =
      type + new Date().format("yy") + "-" + count.toString().padStart(3, "0");
    return id;
  }

  const getNextTitleByType = function (type) {
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
            const refreshTask = addTask(tasks.refreshPlans);
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
              vm.tabs.selectById(vm.tabOpts.detail);
              finishTask(refreshTask);
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
    edit: async function () {
      const id = self.selectedRecord.ID();
      const entity = await appContext.Plans.FindById(id);

      // Two separate views, since we don't want the "Flattened Name" fields on the forms.
      let formView, submitView;
      if (self.selectedRecord.curUserHasRole(ROLES.ADMINTYPE.QTM)) {
        formView = Plan.Views.QTMEditForm;
        submitView = Plan.Views.QTMEditSubmit;
      } else {
        formView = Plan.Views.SubmitterEditForm;
        submitView = Plan.Views.SubmitterEditSubmit;
      }

      const form = FormManager.EditForm({
        entity: entity,
        view: formView,
        onSubmit: () => editPlan(entity, submitView),
      });

      const options = {
        title: `Editing ${entity.Title}`,
        form,
        dialogReturnValueCallback: OnCallbackFormRefresh,
      };

      ModalDialog.showModalDialog(options);
    },
    view: async function () {
      const id = self.selectedRecord.ID();
      const plan = await appContext.Plans.FindById(id);

      const planViewForm = FormManager.DispForm({
        entity: plan,
        view: Plan.Views.View,
      });
      const options = {
        title: "View Plan " + plan.Title,
        form: planViewForm,
      };

      ModalDialog.showModalDialog(options);
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
    displayCloseDialog: async function () {
      // $("#close-modal").modal("show");
      const planId = self.selectedPlan()?.ID;
      const plan = await appContext.Plans.FindById(planId);
      const form = new CancelPlanForm({ entity: plan });

      const options = {
        title: "Are you sure you want to close this plan?",
        form,
        dialogReturnValueCallback: OnCallbackFormRefresh,
      };

      ModalDialog.showModalDialog(options);
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
        const openTask = addTask(tasks.opening);
        const valuePair = [
          ["ProcessStage", vm.selectedRecord.PreviousStage()],
          ["Active", "1"],
          ["CloseDate", null],
          ["CancelReason", null],
        ];
        app.listRefs.Plans.updateListItem(
          self.selectedRecord.ID(),
          valuePair,
          function () {
            finishTask(openTask);
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
    updateImplementationDate: function () {
      if (
        vm.selectedRecord.ProcessStageKey() != "DevelopingActionPlan" &&
        vm.AdminType() != ROLES.ADMINTYPE.QTM
      ) {
        // If we aren't creating items for the first time, our target date
        // shouldn't be updated here.
        return;
      }
      let maxDate = vm.section.Actions.findLastActionTargetDate();

      maxDate = vm.controls.record.extension.totalExtensionDate(maxDate);
      const valuePair = [["ImplementationTargetDate", maxDate.toISOString()]];
      console.log(valuePair);
      var planId = vm.selectedRecord.ID();
      app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  self.controls.rejectStage = function () {
    // const myModal = new bootstrap.Modal(
    //   document.getElementById("rejectionInformation")
    // );
    // myModal.show();

    const plan = ko.unwrap(self.selectedPlan);

    const rejection = new Rejection();

    rejection.Title.Value(plan.Title.Value());
    rejection.Active.Value(true);
    rejection.Rejector.Value(currentUser.Title);

    const currentStage = plan.ProcessStage.Value();
    rejection.Stage.Value(currentStage);

    const rejectionId =
      plan.Title.Value() +
      "-R" +
      String(self.Rejections().length).padStart(2, "0");

    rejection.RejectionId.Value(rejectionId);

    const form = FormManager.NewForm({
      entity: rejection,
      view: Rejection.Views.New,
    });

    const options = {
      title: "New Rejection",
      form,
      dialogReturnValueCallback: (result) =>
        self.controls.rejectStageSubmit(result, plan, rejection),
    };

    ModalDialog.showModalDialog(options);
  };

  self.controls.rejectStageSubmit = async function (result, plan, rejection) {
    if (result !== SP.UI.DialogResult.OK) {
      return;
    }
    // When the user submits the modal with the reason, create a
    // new rejection, then execute the stages reject function
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

    // app.listRefs.Rejections.createListItem(rejectVp, next);

    // $("#rejectionInformation").modal("hide");
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
        onStageApprovedCallback
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
    targetVerificationDate: new DateField({
      displayName: "Effectiveness Verification Target Date",
    }),
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
          self.controls.stage3.targetVerificationDate.get(),
        ],
        ["SubmittedImplementDate", new Date().toISOString()],
      ];

      app.listRefs.Plans.updateListItem(
        vm.selectedRecord.ID(),
        valuePair,
        onStageApprovedCallback
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
        onStageApprovedCallback
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
        return !self.controls.stage3.targetVerificationDate.Value();
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

  self.onNewPlanCreated = function (result, args) {
    if (result !== SP.UI.DialogResult.OK) {
      return;
    }
    const refreshTask = addTask(tasks.refreshPlans);
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
          async () => {
            // Send Notification
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
      // m_fnForward();
    });
  };
}

class App {
  constructor() {
    const app = new CAPViewModel();
    Object.assign(this, app);
  }

  appLoadTime = ko.observable();

  clickNewPlan() {
    const plan = new Plan();

    // const planEditForm = FormManager.NewForm(plan, Plan.Views.New);

    const newPlanForm = new NewPlanForm({});

    const options = {
      title: "Create a new CAR or CAP",
      form: newPlanForm,
      dialogReturnValueCallback: this.onNewPlanCreated,
    };

    ModalDialog.showModalDialog(options);
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
    const app = new App();
    await app.init();
    return app;
  }
}

window.vm = {};

if (document.readyState === "ready" || document.readyState === "complete") {
  initApp();
} else {
  document.onreadystatechange = () => {
    if (document.readyState === "complete" || document.readyState === "ready") {
      ExecuteOrDelayUntilScriptLoaded(function () {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", initApp);
      }, "sp.js");
    }
  };
}
