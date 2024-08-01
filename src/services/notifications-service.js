import { ROLES } from "../constants.js";
import { Notification } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import {
  developingActionPlanTemplate,
  implementingActionPlanTemplate,
  pendingEffectivenessApprovalTemplate,
  pendingEffectivenessSubmissionRejectedTemplate,
  pendingEffectivenessSubmissionTemplate,
  pendingImplementationApproval,
  pendingPlanApprovalTemplate,
  pendingProblemApprovalTemplate,
} from "../notification-templates/index.js";
import { getAnchorRoleLinkToPlan } from "./plan-service.js";
import { addTask, finishTask, tasks } from "./tasks-service.js";

const defaultContact = {
  QTM: "CGFSQMSCARCAP@state.gov",
  QTMB: "CGFSQMSBCARCAP@state.gov",
};

const approvedStageNotificationMap = {
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
  "Pending QTM Effectiveness Approval": pendingQtmEffectivenessApproval,
};

function subjectTemplate(plan, content = null) {
  content = content ?? plan.ProcessStage.toString();
  return `QMS-CAR/CAP - ${content} - ${plan.Title.Value()}`;
}

async function pendingQtmbProblemApproval(plan) {
  const to = [defaultContact.QTMB];

  const subject = subjectTemplate(plan, "Pending QTM-B Problem Approval");
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTMB);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

async function pendingQtmProblemApproval(plan) {
  const to = [defaultContact.QTM];

  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTM);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQsoProblemApproval(plan) {
  const qso = plan.QSO.Value();
  if (!qso) return;
  const to = [qso.Email];

  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQaoProblemApproval(plan) {
  const qo = plan.QAO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function developingActionPlan(plan) {
  const coordinator = plan.ProblemResolver.Value();
  const to = [coordinator.Email];

  const subject = subjectTemplate(plan);
  let body = developingActionPlanTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQsoPlanApproval(plan) {
  const qo = plan.QSO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQaoPlanApproval(plan) {
  const qo = plan.QAO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQtmbPlanApproval(plan) {
  const to = [defaultContact.QTMB];

  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES.ADMINTYPE.QTMB);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTMB);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQtmPlanApproval(plan) {
  const to = [defaultContact.QTM];

  const subject = subjectTemplate(plan);
  let body = pendingPlanApprovalTemplate(plan, ROLES.ADMINTYPE.QTM);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTM);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

async function implementingActionPlan(plan) {
  const coordinator = plan.ProblemResolver.Value();
  const actionsResult = await appContext.Actions.FindByTitle(
    plan.Title.Value()
  );
  if (!actionsResult?.results) return;

  const actionTakerEmails = new Set(
    actionsResult.results.map(
      (action) => action.ActionResponsiblePerson.Value()?.Email
    )
  );
  actionTakerEmails.delete(null);

  const to = [...actionTakerEmails, coordinator.Email];
  const subject = subjectTemplate(plan);
  let body = implementingActionPlanTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQsoImplementationApproval(plan) {
  const qo = plan.QSO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  let body = pendingImplementationApproval(plan, ROLES.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingEffectivenessSubmission(plan) {
  const coordinator = plan.ProblemResolver.Value();

  const to = [coordinator.Email];

  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessSubmissionTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingEffectivenessSubmissionRejected(plan) {
  const coordinator = plan.ProblemResolver.Value();

  const to = [coordinator.Email];

  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessSubmissionRejectedTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQsoEffectivenessApproval(plan) {
  const qo = plan.QSO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES.ADMINTYPE.QO);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQtmbEffectivenessApproval(plan) {
  const to = [defaultContact.QTMB];

  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES.ADMINTYPE.QTMB);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTMB);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQtmEffectivenessApproval(plan) {
  const to = [defaultContact.QTM];

  const subject = subjectTemplate(plan);
  let body = pendingEffectivenessApprovalTemplate(plan, ROLES.ADMINTYPE.QTM);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTM);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

export async function stageApprovedNotification(plan, newStage = null) {
  newStage = newStage ?? plan.ProcessStage.Value();
  const notificationFunction = approvedStageNotificationMap[newStage];
  if (!notificationFunction) return;
  const notificationTask = addTask(tasks.notification());
  const folderPath = plan.Title.Value();

  await appContext.Notifications.UpsertFolderPath(folderPath);

  const notification = await notificationFunction(plan);
  if (notification) {
    const result = await appContext.Notifications.AddEntity(
      notification,
      folderPath
    );
  }
  finishTask(notificationTask);
}

export function stageRejected(newStage, plan, rejection) {}
