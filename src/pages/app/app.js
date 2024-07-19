import { CAPViewModel } from "../../vm.js";
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
var app = app || {};

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

$("#tabs").on("click", function () {
  curPath = location.href;
  vm.tab($("#tabs").tabs("option", "active"));

  //history.pushState({}, "", curPath);
});

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
// columDefs option is used to set style for the first column of the table value
// initComplete option is used to set the dropdown filters for all columns
function makeDataTable(id) {
  //check if this is already a datatable
  if ($(id).hasClass("dataTable")) {
    return;
  }
  var table = $(id).DataTable({
    // columnDefs: [{ width: "10%", targets: 0 }],
    order: [[4, "asc"]],
    iDisplayLength: 25,
    bSortCellsTop: true,
    deferRender: true,
    bDestroy: true,
    initComplete: function () {
      //var table = this.api().table().node();
      this.api()
        .columns()
        .every(function () {
          var column = this;
          var tbl = $(column.header()).closest("table");
          var filterCell = tbl.find("thead tr:eq(1) th").eq(column.index());
          // var select = $(
          //   '<select class="form-select"><option value=""></option></select>'
          // );
          var select = $(
            '<select class="ui long compact dropdown search selection multiple"><option value=""></option></select>'
          );
          switch (filterCell.attr("class")) {
            case "select-filter":
              select.attr("multiple", "true");
            case "single-select-filter":
              select.appendTo(filterCell.empty()).on("change", function () {
                var vals = $(this).val();
                if (!vals) {
                  vals = [];
                } else {
                  vals = vals.map(function (value) {
                    return value
                      ? "^" + $.fn.dataTable.util.escapeRegex(value) + "$"
                      : null;
                  });
                }
                var val = vals.join("|");
                column.search(val, true, false).draw();
              });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
              break;
            case "search-filter":
              $(
                '<div class="ui fluid input">' +
                  '<input type="text" placeholder="Search..." style="width: 100%"/>' +
                  "</div>"
              )
                .appendTo(filterCell.empty())
                .on("keyup change clear", function () {
                  const val = this.querySelector("input").value;
                  if (column.search() !== val) {
                    column.search(val).draw();
                  }
                });
              break;
            case "bool-filter":
              // Does this row contain data?
              var checkbox = $('<input type="checkbox"></input>')
                .appendTo(filterCell.empty())
                .change(function () {
                  if (this.checked) {
                    column.search("true").draw();
                  } else {
                    column.search("").draw();
                  }
                });
              break;
            default:
          }
          if (filterCell.attr("column-width")) {
            // Clear width
            tbl.find("thead tr:eq(0) th").eq(column.index()).width("");
          }
        });
    },
  });
  $(id).css("width", "100%");
}

function navigateToRecord(record) {
  vm.CAPID(record.Title);
  //Common.Utilities.updateUrlParam("capid", record.Title);
  //LoadSelectedCAP(record.Title);
  vm.selectedTitle(record.Title);

  vm.tab(TABS.PLANDETAIL);
}

//TAB 1

// Loading CAP data
// This is where we structure the query for what get's loaded on main tab page and the drop-down on the specific record page.
function LoadMainData(next) {
  vm.app.processes.addTask(appProcessesStates.refreshPlans);
  next = next ? next : function () {};
  var dataLoadIncrementer = new Incremental(0, 3, () => {
    vm.app.processes.finishTask(appProcessesStates.refreshPlans);
    next();
  });
  // Let's load our Actions and our Items
  app.listRefs.Plans.getListItems("", function (plans) {
    vm.allRecordsArray(plans);
    dataLoadIncrementer.inc();
  });

  app.listRefs.Actions.getListItems("", function (actions) {
    vm.allActionsArray(actions);
    dataLoadIncrementer.inc();
  });

  app.listRefs.BusinessOffices.getListItems("", function (offices) {
    vm.allBusinessOffices(offices);
    dataLoadIncrementer.inc();
  });

  app.listRefs.TempQOs.getListItems("", function (offices) {
    vm.allTempQOs(offices);
    dataLoadIncrementer.inc();
  });
}

function loadSelectedRecordByObj(record) {
  LoadSelectedCAP(record.Title);
}
// IMPORTANT - use this section to hide and show elements to the user based on permission level.
function LoadSelectedCAP(capid) {
  vm.app.processes.addTask(appProcessesStates.view);

  var capid = capid.Title ? capid.Title : capid;

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
    vm.app.processes.finishTask(appProcessesStates.view);
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

function UpdateImplementationDate() {
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
  valuePair = [["ImplementationTargetDate", maxDate.toISOString()]];
  console.log(valuePair);
  var planId = vm.selectedRecord.ID();
  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

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
  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectProblemQSO() {
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
  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}
function m_fnRejectProblemQAO() {
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
  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectProblemQTMB() {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTM-B" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var valuePair = [
    ["QTMBProblemAdjudication", "Rejected"],
    ["QTMBAdjudicationDate", ts],
    ["ProcessStage", "Editing"],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectProblemQTM(planId) {
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
  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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
    app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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
function m_fnRejectPlanQSO() {
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectPlanQTMB() {
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectPlanQTM() {
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

// Set the CAPProcessStage to Pending QSO Approval
function m_fnRejectImplement() {
  var planId = vm.selectedRecord.ID();
  var ts = new Date().toISOString();
  var valuePair = [
    ["ProcessStage", "Implementing Action Plan"],
    ["QSOImplementAdjudication", "Rejected"],
    ["QSOImplementAdjudicationDate", ts],
  ];

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectEffectivenessQSO(planId) {
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectEffectivenessQTMB(planId) {
  var planId = vm.selectedRecord.ID();
  if (!vm.selectedRecord.curUserHasRole(ROLES.QTMB)) {
    alert('You don\'t have the correct role "QTMB" to perform this action');
    return;
  }
  var ts = new Date().toISOString();

  var rejectReason = vm.effectivenessRejectReason();

  var valuePair = [
    ["QMSBEffectivenessAdjudication", "Rejected"],
    ["QMSBEffectivenessAdjudicationDate", ts],
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

function m_fnRejectEffectivenessQTM() {
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

  app.listRefs.Plans.updateListItem(planId, valuePair, m_fnRefresh);
}

/* CALLBACKS AND PAGE MANIPULATIONS */

function m_fnRefresh(result, value) {
  if (typeof result !== "undefined" && result == SP.UI.DialogResult.CANCEL) {
    return;
  }
  vm.app.processes.addTask(appProcessesStates.refresh);
  LoadMainData(function () {
    LoadSelectedCAP(vm.selectedTitle());
    vm.app.processes.finishTask(appProcessesStates.refresh);
  });
}

function OnCapCreateCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    vm.app.processes.addTask(appProcessesStates.refreshPlans);
    app.listRefs.Plans.getListItems("", function (items) {
      var id = items[items.length - 1];
      vm.allRecordsArray(items);
      vm.selectedTitle(id.Title);
      vm.tab(TABS.PLANDETAIL);
      vm.app.processes.finishTask(appProcessesStates.refreshPlans);
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
    vm.app.processes.addTask(appProcessesStates.newAction);
    app.listRefs.Actions.getListItems("", function (actions) {
      vm.allActionsArray(actions);
      UpdateImplementationDate();
      vm.app.processes.finishTask(appProcessesStates.newAction);
    });
  }
}

function OnActionCreateCallback(result, value) {
  if (result === SP.UI.DialogResult.OK) {
    vm.app.processes.addTask(appProcessesStates.newAction);
    // The user has modified the Action, the Associated CAP must be updated.
    app.listRefs.Actions.getListItems("", function (actions) {
      vm.allActionsArray(actions);
      UpdateImplementationDate();
      vm.app.processes.finishTask(appProcessesStates.newAction);
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
  vm.app.processes.addTask(appProcessesStates.closing);
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
    vm.app.processes.finishTask(appProcessesStates.closing);
  });
}
// var incrementer;

/**
 *
 * @param {string} title the title of the plan e.g. C20-030
 * @param {bool} lock pass true to lock request
 */
function toggleLockPlan(title, lock, callback) {
  vm.app.processes.addTask(appProcessesStates.lock);
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
    vm.app.processes.finishTask(appProcessesStates.lock);
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

  vm.currentUser(sal.globalConfig.currentUser);
  var tab = Common.Utilities.getUrlParam("tab");
  var capid = Common.Utilities.getUrlParam("capid");

  $("#showme").hide();

  $("#tabs").show();
  $("#tabs").tabs();

  var defaultTab = TABS.MYPLANS;
  switch (vm.AdminType()) {
    case ROLES.ADMINTYPE.QO:
      defaultTab = TABS.QOPLANS;
      break;
    case ROLES.ADMINTYPE.QTM:
      defaultTab = TABS.ALLPLANS;
      break;
    case ROLES.ADMINTYPE.QTMB:
      defaultTab = TABS.QTMBPLANS;
      break;
    default:
  }

  vm.tab(tab || defaultTab);

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

  vm.app.processes.finishTask(appProcessesStates.init);
  // var idTab =
  // $('#injectAdditionalTabs').
  loadFinish = new Date();
  console.log("Application Load Time: ", (loadFinish - loadStart) / 1000);
}

var loadStart,
  loadFinish = 0;

function initApp() {
  loadStart = new Date();
  initSal();
  Common.Init();
  vm = new CAPViewModel();
  vm.app.processes.addTask(appProcessesStates.init);
  initStaticListRefs();

  LoadMainData(initComplete); // This will call initComplete() when all data is loaded
}

$(document).ready(function () {
  SP.SOD.executeFunc(
    "sp.js",
    "SP.ClientContext",
    ExecuteOrDelayUntilScriptLoaded(initApp, "SP.JS")
  );
}); // end Document Ready
