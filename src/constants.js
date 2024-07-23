export const ROLES = {
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

export const PLANTYPE = {
  CAP: "CAP",
  CAR: "CAR",
};

export const LOCATION = {
  ALL: "All",
  CHARLESTON: "Charleston",
  BANGKOK: "Bangkok",
  WASHINGTON: "Washington",
  PARIS: "Paris",
  SOFIA: "Sofia",
  MANILA: "Manila",
};

export const stageDescriptions = {
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
