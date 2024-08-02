import { ROLES, stageDescriptions } from "../constants.js";
import { Notification } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import {
  developingActionPlanRejectedTemplate,
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

async function developingActionPlan(plan) {
  // const coordinator = plan.ProblemResolverName.Value();
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const to = [coordinatorEmail];

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
    body,
  });
}

async function pendingQsoPlanApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];

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

async function pendingQaoPlanApproval(plan) {
  const qoEmail = await getQaoEmail(plan);
  const to = [qoEmail];

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
  const coordinatorEmail = await getCoordinatorEmail(plan);
  const actionsResult = await appContext.Actions.FindByTitle(
    plan.Title.Value()
  );
  if (!actionsResult?.results) return;

  const actionTakerEmails = new Set(
    await Promise.all(
      actionsResult.results.map((action) =>
        getEmailFromField(action.ActionResponsiblePerson)
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
    body,
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
    body,
  });
}

async function pendingQsoImplementationApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];

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
    body,
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
    body,
  });
}

async function pendingQsoEffectivenessApproval(plan) {
  const qoEmail = await getQsoEmail(plan);
  const to = [qoEmail];

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

  const notification = await notificationFunction(plan);
  await sendPlanNotification(plan, notification);

  finishTask(notificationTask);
}

export async function stageRejectedNotification(plan, rejection) {
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

async function sendPlanNotification(plan, notification) {
  if (!notification) return;
  const folderPath = plan.Title.Value();
  await appContext.Notifications.UpsertFolderPath(folderPath);
  const result = await appContext.Notifications.AddEntity(
    notification,
    folderPath
  );
  return;
}
